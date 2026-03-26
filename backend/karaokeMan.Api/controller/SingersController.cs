using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;
using KaraokeMan.Api.Models;

namespace KaraokeMan.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SingersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public SingersController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<object>> GetAllSingers()
        {
            var singers = await _context.Singers
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.CreatedAt
                })
                .ToListAsync();
            
            return Ok(new { singers });
        }
        
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<object>> CreateSinger([FromBody] CreateSingerDto dto)
        {                    
            var singer = new Singer
            {
                Name = dto.Name
            };
            
            _context.Singers.Add(singer);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetAllSingers), new
            {
                message = "Singer created",
                singer = new
                {
                    singer.Id,
                    singer.Name,
                    singer.CreatedAt
                }
            });
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteSinger(int id)
        {
            var singer = await _context.Singers.FindAsync(id);
            
            if (singer == null)
            {
                return NotFound(new { message = "Singer not found" });
            }
            
            _context.Singers.Remove(singer);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Singer deleted" });
        }

        // GET /api/sessions/{sessionId}/singers
        [HttpGet("/api/sessions/{sessionId}/singers")]
        [Authorize]
        public async Task<ActionResult> GetSingersBySession(int sessionId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            var singers = await _context.QueueItems
                .Where(q => q.SessionId == sessionId)
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .GroupBy(q => q.Singer)
                .Select(g => new
                {
                    g.Key.Id,
                    g.Key.Name,
                    g.Key.CreatedAt,
                    QueuePosition = g
                        .Where(q => q.Status == "waiting" || q.Status == "singing")
                        .OrderBy(q => q.Position)
                        .Select(q => (int?)q.Position)
                        .FirstOrDefault(),
                    CurrentStatus = g.Any(q => q.Status == "singing") ? "singing" :
                                    g.Any(q => q.Status == "waiting") ? "waiting" : "completed",
                    SkipNextRound = g.Any(q => q.SkipNextRound && (q.Status == "waiting" || q.Status == "singing")),
                    SongsSung = g
                        .Where(q => q.Status == "completed")
                        .Select(q => new
                        {
                            SongTitle = q.Song != null ? q.Song.Title : "Unknown",
                            SongArtist = q.Song != null ? q.Song.Artist : null,
                            q.Position
                        })
                        .ToList(),
                    TotalSongs = g.Count()
                })
                .ToListAsync();

            return Ok(singers);
        }
        
        // POST /api/sessions/{sessionId}/singers
        // POST /api/sessions/{sessionId}/singers/{singerId}/readd
        [HttpPost("/api/sessions/{sessionId}/singers/{singerId}/readd")]
        [Authorize]
        public async Task<ActionResult> ReAddSingerToQueue(int sessionId, int singerId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            if (!session.IsActive)
                return BadRequest(new { message = "Session is no longer active" });

            var singer = await _context.Singers.FindAsync(singerId);
            if (singer == null)
                return NotFound(new { message = "Singer not found" });

            // Check singer belongs to this session
            var existsInSession = await _context.QueueItems
                .AnyAsync(q => q.SessionId == sessionId && q.SingerId == singerId);
            if (!existsInSession)
                return BadRequest(new { message = "Singer does not belong to this session" });

            // Check not already waiting
            var alreadyWaiting = await _context.QueueItems
                .AnyAsync(q => q.SessionId == sessionId && q.SingerId == singerId && q.Status == "waiting");
            if (alreadyWaiting)
                return BadRequest(new { message = "Singer is already in the queue" });

            var nextPosition = await _context.QueueItems
                .Where(q => q.SessionId == sessionId)
                .MaxAsync(q => (int?)q.Position) ?? 0;
            nextPosition++;

            var queueItem = new QueueItem
            {
                SessionId = sessionId,
                SingerId = singerId,
                Position = nextPosition,
                Status = "waiting"
            };

            _context.QueueItems.Add(queueItem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Singer re-added to queue",
                queueItem = new { queueItem.Id, queueItem.Position, queueItem.Status }
            });
        }

        // POST /api/sessions/{sessionId}/singers
        [HttpPost("/api/sessions/{sessionId}/singers")]
        [Authorize]
        public async Task<ActionResult> AddSingerToSession(int sessionId, [FromBody] CreateSingerDto dto)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            if (!session.IsActive)
                return BadRequest(new { message = "Session is no longer active" });

            var singer = new Singer { Name = dto.Name };
            _context.Singers.Add(singer);
            await _context.SaveChangesAsync();

            var nextPosition = await _context.QueueItems
                .Where(q => q.SessionId == sessionId)
                .MaxAsync(q => (int?)q.Position) ?? 0;
            nextPosition++;

            var queueItem = new QueueItem
            {
                SessionId = sessionId,
                SingerId = singer.Id,
                Position = nextPosition,
                Status = "waiting"
            };

            _context.QueueItems.Add(queueItem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                singer = new { singer.Id, singer.Name },
                queueItem = new { queueItem.Id, queueItem.Position, queueItem.Status }
            });
        }
            

        // DELETE /api/sessions/{sessionId}/singers/{singerId}
        [HttpDelete("/api/sessions/{sessionId}/singers/{singerId}")]
        [Authorize]
        public async Task<ActionResult> RemoveSingerFromSession(int sessionId, int singerId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            var queueItems = await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.SingerId == singerId)
                .ToListAsync();

            if (!queueItems.Any())
                return NotFound(new { message = "Singer not found in this session" });

            _context.QueueItems.RemoveRange(queueItems);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Singer removed from session" });
        }

    }
    
    public class CreateSingerDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
