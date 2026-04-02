using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Email { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "user"; // "admin" or "user"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
