using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Models
{
    public class Session
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? RoomName { get; set; } = string.Empty;
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        public int CurrentRound { get; set; } = 1;
        
        // Navigation property
        public ICollection<QueueItem> QueueItems { get; set; } = new List<QueueItem>();
    }
}
