using System.ComponentModel.DataAnnotations;

namespace KaraokeMan.Api.Features.Songs
{
    public class SongDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Artist { get; set; }
        public string? Link { get; set; }
    }
    
    public class CreateSongDto
    {
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Artist { get; set; }
        
        [MaxLength(500)]
        public string? Link { get; set; }
    }
    
    public class UpdateSongDto
    {
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Artist { get; set; }
        
        [MaxLength(500)]
        public string? Link { get; set; }
    }
}
