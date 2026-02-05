using Microsoft.AspNetCore.Mvc;
using KaraokeManagement.API.Models;

namespace KaraokeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SingersController : ControllerBase
{
    // Temporary in-memory storage (we'll replace with database later)
    private static List<Singer> _singers = new()
    {
        new Singer { Id = 1, Name = "John Doe"},
        new Singer { Id = 2, Name = "Jane Smith"}
    };

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_singers);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var singer = _singers.FirstOrDefault(s => s.Id == id);
        if (singer == null)
            return NotFound();
        
        return Ok(singer);
    }

    [HttpPost]
    public IActionResult Register([FromBody] RegisterSingerRequest request)
    {
        var singer = new Singer
        {
            Id = _singers.Any() ? _singers.Max(s => s.Id) + 1 : 1,
            Name = request.Name
        };
        
        _singers.Add(singer);
        return CreatedAtAction(nameof(GetById), new { id = singer.Id }, singer);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var singer = _singers.FirstOrDefault(s => s.Id == id);
        if (singer == null)
            return NotFound();
        
        _singers.Remove(singer);
        return NoContent();
    }
}

public record RegisterSingerRequest(string Name, string? PhoneNumber);