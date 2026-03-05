using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Models;

namespace KaraokeMan.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Singer> Singers { get; set; }
        public DbSet<Song> Songs { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<QueueItem> QueueItems { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure relationships
            modelBuilder.Entity<QueueItem>()
                .HasOne(q => q.Session)
                .WithMany(s => s.QueueItems)
                .HasForeignKey(q => q.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<QueueItem>()
                .HasOne(q => q.Singer)
                .WithMany(s => s.QueueItems)
                .HasForeignKey(q => q.SingerId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<QueueItem>()
                .HasOne(q => q.Song)
                .WithMany(s => s.QueueItems)
                .HasForeignKey(q => q.SongId)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Seed default data
            modelBuilder.Entity<Session>().HasData(
                new Session
                {
                    Id = 1,
                    Name = "Default Session",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            );
            
            // Seed default admin user (password: admin123)
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Email = "admin@karaoke.com",
                    Role = "admin",
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
