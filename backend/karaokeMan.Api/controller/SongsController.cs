using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;
using KaraokeMan.Api.DTOs;
using KaraokeMan.Api.Models;

namespace KaraokeMan.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public SongsController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<object>> GetAllSongs()
        {
            var songs = await _context.Songs
                .OrderBy(s => s.Title)
                .Select(s => new SongDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Artist = s.Artist,
                    Link = s.Link
                })
                .ToListAsync();
            
            return Ok(new { songs });
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<object>> SearchSongs([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest(new { message = "Search query required" });
            }
            
            var songs = await _context.Songs
                .Where(s => s.Title.Contains(q) || (s.Artist != null && s.Artist.Contains(q)))
                .OrderBy(s => s.Title)
                .Select(s => new SongDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Artist = s.Artist,
                    Link = s.Link
                })
                .ToListAsync();
            
            return Ok(new { songs });
        }
        
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<object>> CreateSong([FromBody] CreateSongDto dto)
        {
            var song = new Song
            {
                Title = dto.Title,
                Artist = dto.Artist,
                Link = dto.Link
            };
            
            _context.Songs.Add(song);
            await _context.SaveChangesAsync();
            
            var songDto = new SongDto
            {
                Id = song.Id,
                Title = song.Title,
                Artist = song.Artist,
                Link = song.Link
            };
            
            return CreatedAtAction(nameof(GetAllSongs), new { message = "Song created", song = songDto });
        }
        
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<object>> UpdateSong(int id, [FromBody] UpdateSongDto dto)
        {
            var song = await _context.Songs.FindAsync(id);
            
            if (song == null)
            {
                return NotFound(new { message = "Song not found" });
            }
            
            song.Title = dto.Title;
            song.Artist = dto.Artist;
            song.Link = dto.Link;
            
            await _context.SaveChangesAsync();
            
            var songDto = new SongDto
            {
                Id = song.Id,
                Title = song.Title,
                Artist = song.Artist,
                Link = song.Link
            };
            
            return Ok(new { message = "Song updated", song = songDto });
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteSong(int id)
        {
            var song = await _context.Songs.FindAsync(id);
            
            if (song == null)
            {
                return NotFound(new { message = "Song not found" });
            }
            
            _context.Songs.Remove(song);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Song deleted" });
        }
    }
}
