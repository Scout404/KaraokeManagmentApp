namespace KaraokeManagement.API.Models;

public class QueueEntry
{
    public int Id { get; set; }
    public int SingerId { get; set; }
    public Singer Singer { get; set; } = null!;
    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
    public int Position { get; set; }
    public QueueStatus Status { get; set; } = QueueStatus.Waiting;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}

public enum QueueStatus
{
    Waiting = 1,
    Singing = 2,
    Completed = 3,
    Skipped = 4
}