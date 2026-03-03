using Microsoft.EntityFrameworkCore;
using KaraokeManagement.API.Models;

namespace KaraokeManagement.API.Data;

public class KaraokeDbContext : DbContext
{
    public KaraokeDbContext(DbContextOptions<KaraokeDbContext> options) 
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Singer> Singers { get; set; }
    public DbSet<Song> Songs { get; set; }
    public DbSet<QueueEntry> QueueEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed initial admin user with FIXED date
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), 
                Role = UserRole.Admin,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) // Fixed date
            },
            new User
            {
                Id = 2,
                Username = "worker",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("worker123"), // TODO: Hash this properly
                Role = UserRole.Worker,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) // Fixed date
            }
        );
    }
}