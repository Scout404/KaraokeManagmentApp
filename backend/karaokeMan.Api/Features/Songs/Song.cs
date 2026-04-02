using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Models
{
    public class Song
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Artist { get; set; }
        
        [MaxLength(500)]
        public string? Link { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<QueueItem> QueueItems { get; set; } = new List<QueueItem>();
    }
}
