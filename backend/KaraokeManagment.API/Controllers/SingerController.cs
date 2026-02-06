using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaraokeManagement.API.Models;
using KaraokeManagement.API.Data;

namespace KaraokeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SingersController : ControllerBase
{
    private readonly KaraokeDbContext _context;

    public SingersController(KaraokeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var singers = await _context.Singers
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.RegisteredAt)
            .ToListAsync();
        
        return Ok(singers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var singer = await _context.Singers.FindAsync(id);
        
        if (singer == null)
            return NotFound();
        
        return Ok(singer);
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterSingerRequest request)
    {
        var singer = new Singer
        {
            Name = request.Name,
            RegisteredAt = DateTime.UtcNow,
            IsActive = true
        };
        
        _context.Singers.Add(singer);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = singer.Id }, singer);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var singer = await _context.Singers.FindAsync(id);
        
        if (singer == null)
            return NotFound();
        
        _context.Singers.Remove(singer);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}

public record RegisterSingerRequest(string Name);