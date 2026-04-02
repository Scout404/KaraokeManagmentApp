using KaraokeMan.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using KaraokeMan.Api.Features.Queue;
using KaraokeMan.Api.Services;
using KaraokeMan.Api.Hubs;
using Microsoft.EntityFrameworkCore;

namespace KaraokeMan.Api.Features.Queue
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueueController : ControllerBase
    {
        private readonly IQueueService _queueService;
        private readonly IHubContext<KaraokeHub> _hubContext;
        private readonly ApplicationDbContext _context;
        
        public QueueController(IQueueService queueService, IHubContext<KaraokeHub> hubContext, ApplicationDbContext context)
        {
            _queueService = queueService;
            _hubContext = hubContext;
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<object>> GetQueue([FromQuery] int sessionId = 1)
        {
            var queue = await _queueService.GetQueueAsync(sessionId);
            return Ok(new { queue });
        }

        // PATCH /api/queue/{queueItemId}/song
        // Assigns a song to an existing queue item
        [HttpPatch("/api/queue/{queueItemId}/song")]
        [Authorize]
        public async Task<ActionResult> AssignSong(int queueItemId, [FromBody] AssignSongDto dto)
        {
            var queueItem = await _context.QueueItems
                .Include(q => q.Song)
                .FirstOrDefaultAsync(q => q.Id == queueItemId);

            if (queueItem == null)
                return NotFound(new { message = "Queue item not found" });

            // If songId provided, validate it exists
            if (dto.SongId.HasValue)
            {
                var song = await _context.Songs.FindAsync(dto.SongId.Value);
                if (song == null)
                    return NotFound(new { message = "Song not found" });
                queueItem.SongId = dto.SongId.Value;
            }
            else
            {
                // Allow clearing the song
                queueItem.SongId = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                queueItem.Id,
                queueItem.SingerId,
                queueItem.SessionId,
                queueItem.Position,
                queueItem.Status,
                Song = queueItem.Song == null ? null : new
                {
                    queueItem.Song.Id,
                    queueItem.Song.Title,
                    queueItem.Song.Artist,
                    queueItem.Song.Link
                }
            });
        }
        
        [HttpGet("waiting")]
        public async Task<ActionResult<object>> GetWaitingQueue([FromQuery] int sessionId = 1)
        {
            var queue = await _queueService.GetWaitingQueueAsync(sessionId);
            return Ok(new { queue });
        }
        
        [HttpGet("current")]
        public async Task<ActionResult<object>> GetCurrent([FromQuery] int sessionId = 1)
        {
            var current = await _queueService.GetCurrentSingerAsync(sessionId);
            return Ok(new { current });
        }
        
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<object>> AddToQueue([FromBody] AddToQueueDto dto)
        {
            var queueItem = await _queueService.AddToQueueAsync(dto);
            
            // Notify clients via SignalR
            await _hubContext.Clients.All.SendAsync("queue:updated", new { queue = await _queueService.GetWaitingQueueAsync(dto.SessionId) });
            
            return CreatedAtAction(nameof(GetQueue), new { message = "Added to queue", queueItem });
        }
        
        [HttpPost("next")]
        [Authorize]
        public async Task<ActionResult<object>> CallNext([FromQuery] int sessionId = 1)
        {
            var current = await _queueService.CallNextAsync(sessionId);
            
            if (current == null)
            {
                return Ok(new { message = "No singers in queue" });
            }
            
            // Notify clients via SignalR
            await _hubContext.Clients.All.SendAsync("singer:current", new { current });
            await _hubContext.Clients.All.SendAsync("queue:updated", new { queue = await _queueService.GetWaitingQueueAsync(sessionId) });
            
            return Ok(new { message = "Next singer called", current });
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> RemoveFromQueue(int id)
        {
            var result = await _queueService.RemoveFromQueueAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "Queue item not found" });
            }
            
            // Notify clients via SignalR
            await _hubContext.Clients.All.SendAsync("queue:updated");
            
            return Ok(new { message = "Removed from queue" });
        }
        
        [HttpPut("reorder")]
        [Authorize]
        public async Task<ActionResult<object>> ReorderQueue([FromBody] ReorderQueueDto dto, [FromQuery] int sessionId = 1)
        {
            var queue = await _queueService.ReorderQueueAsync(sessionId, dto.OrderedIds);
            
            // Notify clients via SignalR
            await _hubContext.Clients.All.SendAsync("queue:updated", new { queue });
            
            return Ok(new { message = "Queue reordered", queue });
        }
        
        [HttpDelete("completed/clear")]
        [Authorize]
        public async Task<ActionResult> ClearCompleted([FromQuery] int sessionId = 1)
        {
            await _queueService.ClearCompletedAsync(sessionId);
            return Ok(new { message = "Completed items cleared" });
        }
    }
}
