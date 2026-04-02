using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KaraokeMan.Api.Models
{
    public class QueueItem
    {
        [Key]
        public int Id { get; set; }
        
        public int SessionId { get; set; }
        
        [ForeignKey(nameof(SessionId))]
        public Session Session { get; set; } = null!;
        
        public int SingerId { get; set; }
        
        [ForeignKey(nameof(SingerId))]
        public Singer Singer { get; set; } = null!;
        
        public int? SongId { get; set; }
        
        [ForeignKey(nameof(SongId))]
        public Song? Song { get; set; }
        
        public int Position { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "waiting"; // "waiting", "singing", "completed"
        
        public int Round { get; set; } = 1;
        
        public bool SkipNextRound { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

enum QueueItemStatus
{
    Waiting,
    Singing,
    Completed
}
