namespace KaraokeManagement.API.Models;

public class Song
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? YoutubeUrl { get; set; }
    public int? UploadedBySingerId { get; set; }
    public Singer? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}