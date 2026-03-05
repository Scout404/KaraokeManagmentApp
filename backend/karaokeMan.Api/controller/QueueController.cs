using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using KaraokeMan.Api.DTOs;
using KaraokeMan.Api.Services;
using KaraokeMan.Api.Hubs;

namespace KaraokeMan.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueueController : ControllerBase
    {
        private readonly IQueueService _queueService;
        private readonly IHubContext<KaraokeHub> _hubContext;
        
        public QueueController(IQueueService queueService, IHubContext<KaraokeHub> hubContext)
        {
            _queueService = queueService;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<object>> GetQueue([FromQuery] int sessionId = 1)
        {
            var queue = await _queueService.GetQueueAsync(sessionId);
            return Ok(new { queue });
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
