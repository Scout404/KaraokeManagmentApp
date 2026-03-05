using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeMan.Api.Data;
using KaraokeMan.Api.Models;

namespace KaraokeMan.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SingersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public SingersController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<object>> GetAllSingers()
        {
            var singers = await _context.Singers
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.CreatedAt
                })
                .ToListAsync();
            
            return Ok(new { singers });
        }
        
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<object>> CreateSinger([FromBody] CreateSingerDto dto)
        {
            if (await _context.Singers.AnyAsync(s => s.Name == dto.Name))
            {
                return Conflict(new { message = "Singer already exists" });
            }
            
            var singer = new Singer
            {
                Name = dto.Name
            };
            
            _context.Singers.Add(singer);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetAllSingers), new
            {
                message = "Singer created",
                singer = new
                {
                    singer.Id,
                    singer.Name,
                    singer.CreatedAt
                }
            });
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteSinger(int id)
        {
            var singer = await _context.Singers.FindAsync(id);
            
            if (singer == null)
            {
                return NotFound(new { message = "Singer not found" });
            }
            
            _context.Singers.Remove(singer);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Singer deleted" });
        }
    }
    
    public class CreateSingerDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
