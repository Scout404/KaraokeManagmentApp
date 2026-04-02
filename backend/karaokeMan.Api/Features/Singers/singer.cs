using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Models
{
    public class Singer
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<QueueItem> QueueItems { get; set; } = new List<QueueItem>();
    }
}
