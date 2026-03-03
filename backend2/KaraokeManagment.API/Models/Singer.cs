namespace KaraokeManagement.API.Models;

public class Singer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}