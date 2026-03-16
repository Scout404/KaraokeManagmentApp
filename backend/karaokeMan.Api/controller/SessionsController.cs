using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;
using KaraokeMan.Api.Models;

namespace KaraokeMan.Api.Controllers
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
    }

    public class CreateSessionDto
    {
        public string Name { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
    }
}