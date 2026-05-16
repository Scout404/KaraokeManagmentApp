using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Features.Queue
{
    public class AddToQueueDto
    {
        [Required]
        public string? SingerId { get; set; } 
        
        public int? SongId { get; set; }
        
        public int SessionId { get; set; }
    }
    
    public class QueueItemDto
    {
        public int Id { get; set; }
        public int Position { get; set; }
        public string Status { get; set; } = string.Empty;
        public int SingerId { get; set; }
        public string SingerName { get; set; } = string.Empty;
        public int? SongId { get; set; }
        public string? SongTitle { get; set; }
        public string? SongArtist { get; set; }
        public string? SongLink { get; set; }
        public int Round { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AssignSongDto
    {
        public int? SongId { get; set; }
    }
    
    public class ReorderQueueDto
    {
        [Required]
        public List<int> OrderedIds { get; set; } = new();
    }
}
