using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;
using KaraokeMan.Api.Features.Queue;


namespace KaraokeMan.Api.Features.Sessions
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SessionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all sessions
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetAllSessions()
        {
            var sessions = await _context.Sessions
                .OrderByDescending(s => s.StartedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.RoomName,
                    s.StartedAt,
                    s.EndedAt,
                    s.IsActive,
                    s.CurrentRound,
                    SingerCount = s.QueueItems.Select(q => q.SingerId).Distinct().Count()
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // GET single session
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult> GetSession(int id)
        {
            var session = await _context.Sessions
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.RoomName,
                    s.StartedAt,
                    s.EndedAt,
                    s.IsActive,
                    s.CurrentRound,
                    SingerCount = s.QueueItems.Select(q => q.SingerId).Distinct().Count()
                })
                .FirstOrDefaultAsync();

            if (session == null)
                return NotFound(new { message = "Session not found" });

            return Ok(session);
        }

        // POST create session
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateSession([FromBody] CreateSessionDto dto)
        {
            var session = new Session
            {
                Name = dto.Name,
                RoomName = dto.RoomName,
            };

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, new
            {
                session.Id,
                session.Name,
                session.RoomName,
                session.StartedAt,
                session.IsActive
            });
        }

        // PATCH end session
        [HttpPatch("{id}/end")]
        [Authorize]
        public async Task<ActionResult> EndSession(int id)
        {
            var session = await _context.Sessions.FindAsync(id);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            if (!session.IsActive)
                return BadRequest(new { message = "Session is already ended" });

            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Session ended", session.Id, session.EndedAt });
        }

        // DELETE session
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteSession(int id)
        {
            var session = await _context.Sessions.FindAsync(id);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session deleted" });
        }

        // POST /api/sessions/{sessionId}/nextround
    [HttpPost("/api/sessions/{sessionId}/nextround")]
    [Authorize]
    public async Task<ActionResult> StartNextRound(int sessionId)
    {
        var session = await _context.Sessions.FindAsync(sessionId);
        if (session == null)
            return NotFound(new { message = "Session not found" });

        if (!session.IsActive)
            return BadRequest(new { message = "Session is not active" });

        // Check queue is empty (no waiting or singing items)
        var hasActive = await _context.QueueItems
            .AnyAsync(q => q.SessionId == sessionId &&
                    (q.Status == "waiting" || q.Status == "singing"));
        if (hasActive)
            return BadRequest(new { message = "Current round is not finished yet" });

        // Get all singers from current round in original join order
        // excluding those who have SkipNextRound = true
        var currentRound = session.CurrentRound;
        var singersInOrder = await _context.QueueItems
            .Where(q => q.SessionId == sessionId && q.Round == currentRound)
            .OrderBy(q => q.Position)
            .Include(q => q.Singer)
            .GroupBy(q => q.SingerId)
            .Select(g => new
            {
                SingerId = g.Key,
                FirstPosition = g.Min(q => q.Position),
                SkipNextRound = g.Any(q => q.SkipNextRound)
            })
            .OrderBy(g => g.FirstPosition)
            .ToListAsync();

        if (!singersInOrder.Any())
            return BadRequest(new { message = "No singers found in current round" });

        // Advance round
        session.CurrentRound++;
        await _context.SaveChangesAsync();

        // Get current max position
        var maxPosition = await _context.QueueItems
            .Where(q => q.SessionId == sessionId)
            .MaxAsync(q => (int?)q.Position) ?? 0;

        // Re-add singers who are not skipping
        // Position resets to 1 for each new round
        var newItems = new List<QueueItem>();
        var position = 1;
        foreach (var singer in singersInOrder.Where(s => !s.SkipNextRound))
        {
            newItems.Add(new QueueItem
            {
                SessionId = sessionId,
                SingerId = singer.SingerId,
                Position = position++,
                Status = "waiting",
                Round = session.CurrentRound
            });
        }

        // Reset SkipNextRound for all singers in this session
        var itemsToReset = await _context.QueueItems
            .Where(q => q.SessionId == sessionId && q.SkipNextRound)
            .ToListAsync();
        foreach (var item in itemsToReset)
            item.SkipNextRound = false;

        _context.QueueItems.AddRange(newItems);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Round {session.CurrentRound} started",
            round = session.CurrentRound,
            singersAdded = newItems.Count,
            singersSkipped = singersInOrder.Count(s => s.SkipNextRound)
        });
    }

    // PATCH /api/sessions/{sessionId}/singers/{singerId}/skipround
    [HttpPatch("/api/sessions/{sessionId}/singers/{singerId}/skipround")]
    [Authorize]
    public async Task<ActionResult> ToggleSkipRound(int sessionId, int singerId)
    {
        var session = await _context.Sessions.FindAsync(sessionId);
        if (session == null)
            return NotFound(new { message = "Session not found" });

        // Find the singer's active queue item in this session
        var queueItem = await _context.QueueItems
            .Where(q => q.SessionId == sessionId && q.SingerId == singerId &&
                        (q.Status == "waiting" || q.Status == "singing"))
            .OrderBy(q => q.Position)
            .FirstOrDefaultAsync();

        if (queueItem == null)
            return NotFound(new { message = "Singer is not active in this session's queue" });

        // Toggle skip
        queueItem.SkipNextRound = !queueItem.SkipNextRound;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            singerId,
            skipNextRound = queueItem.SkipNextRound,
            message = queueItem.SkipNextRound
                ? "Singer will skip next round"
                : "Singer will join next round"
        });
    }
    }

    public class CreateSessionDto
    {
        public string Name { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
    }
}