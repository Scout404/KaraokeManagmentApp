using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;

namespace KaraokeMan.Api.Features.Queue
{
    public interface IQueueService
    {
        Task<List<QueueItemDto>> GetQueueAsync(int sessionId);
        Task<List<QueueItemDto>> GetWaitingQueueAsync(int sessionId);
        Task<QueueItemDto?> GetCurrentSingerAsync(int sessionId);
        Task<QueueItemDto> AddToQueueAsync(AddToQueueDto dto);
        Task<QueueItemDto?> CallNextAsync(int sessionId);
        Task<bool> RemoveFromQueueAsync(int id);
        Task<List<QueueItemDto>> ReorderQueueAsync(int sessionId, List<int> orderedIds);
        Task ClearCompletedAsync(int sessionId);
    }
    
    public class QueueService : IQueueService
    {
        private readonly ApplicationDbContext _context;
        
        public QueueService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<QueueItemDto>> GetQueueAsync(int sessionId)
        {
            return await _context.QueueItems
                .Where(q => q.SessionId == sessionId)
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .OrderBy(q => q.Position)
                .Select(q => MapToDto(q))
                .ToListAsync();
        }
        
        public async Task<List<QueueItemDto>> GetWaitingQueueAsync(int sessionId)
        {
            return await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.Status == "waiting")
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .OrderBy(q => q.Position)
                .Select(q => MapToDto(q))
                .ToListAsync();
        }
        
        public async Task<QueueItemDto?> GetCurrentSingerAsync(int sessionId)
        {
            var current = await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.Status == "singing")
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .FirstOrDefaultAsync();
            
            return current != null ? MapToDto(current) : null;
        }
        
        public async Task<QueueItemDto> AddToQueueAsync(AddToQueueDto dto)
        {
            // Verify singer exists
            var singer = await _context.Singers.FindAsync(dto.SingerId);
            if (singer == null)
                throw new InvalidOperationException("Singer not found");

            // Get next position
            var maxPosition = await _context.QueueItems
                .Where(q => q.SessionId == dto.SessionId && q.Status == "waiting")
                .MaxAsync(q => (int?)q.Position) ?? 0;

            var queueItem = new QueueItem
            {
                SessionId = dto.SessionId,
                SingerId = singer.Id,
                SongId = dto.SongId,
                Position = maxPosition + 1,
                Status = "waiting"
            };

            _context.QueueItems.Add(queueItem);
            await _context.SaveChangesAsync();

            var created = await _context.QueueItems
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .FirstAsync(q => q.Id == queueItem.Id);

            return MapToDto(created);
        }
        
        public async Task<QueueItemDto?> CallNextAsync(int sessionId)
        {
            // Mark current as completed
            var current = await _context.QueueItems
                .FirstOrDefaultAsync(q => q.SessionId == sessionId && q.Status == "singing");
            
            if (current != null)
            {
                current.Status = "completed";
            }
            
            // Get next waiting
            var next = await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.Status == "waiting")
                .OrderBy(q => q.Position)
                .Include(q => q.Singer)
                .Include(q => q.Song)
                .FirstOrDefaultAsync();
            
            if (next != null)
            {
                next.Status = "singing";
                await _context.SaveChangesAsync();
                return MapToDto(next);
            }
            
            await _context.SaveChangesAsync();
            return null;
        }
        
        public async Task<bool> RemoveFromQueueAsync(int id)
        {
            var item = await _context.QueueItems.FindAsync(id);
            if (item == null) return false;
            
            var position = item.Position;
            var sessionId = item.SessionId;
            
            _context.QueueItems.Remove(item);
            
            // Reorder positions
            var itemsToReorder = await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.Position > position && q.Status == "waiting")
                .ToListAsync();
            
            foreach (var queueItem in itemsToReorder)
            {
                queueItem.Position--;
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<List<QueueItemDto>> ReorderQueueAsync(int sessionId, List<int> orderedIds)
        {
            var items = await _context.QueueItems
                .Where(q => orderedIds.Contains(q.Id))
                .ToListAsync();
            
            for (int i = 0; i < orderedIds.Count; i++)
            {
                var item = items.First(x => x.Id == orderedIds[i]);
                item.Position = i + 1;
            }
            
            await _context.SaveChangesAsync();
            
            return await GetWaitingQueueAsync(sessionId);
        }
        
        public async Task ClearCompletedAsync(int sessionId)
        {
            var completed = await _context.QueueItems
                .Where(q => q.SessionId == sessionId && q.Status == "completed")
                .ToListAsync();
            
            _context.QueueItems.RemoveRange(completed);
            await _context.SaveChangesAsync();
        }
        
        private static QueueItemDto MapToDto(QueueItem item)
        {
            return new QueueItemDto
            {
                Id = item.Id,
                Position = item.Position,
                Status = item.Status,
                SingerId = item.SingerId,
                SingerName = item.Singer.Name,
                SongId = item.SongId,
                SongTitle = item.Song?.Title,
                SongArtist = item.Song?.Artist,
                SongLink = item.Song?.Link,
                Round = item.Round,
                CreatedAt = item.CreatedAt
            };
        }
    }
}
