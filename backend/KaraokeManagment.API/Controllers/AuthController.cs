using Microsoft.AspNetCore.Mvc;
using KaraokeManagement.API.DTOs;
using KaraokeManagement.API.Services;

namespace KaraokeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.Login(loginDto);

        if (result == null)
            return Unauthorized(new { message = "Invalid username or password" });

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto registerDto)
    {
        var success = await _authService.Register(registerDto);

        if (!success)
            return BadRequest(new { message = "Username already exists or invalid role" });

        return Ok(new { message = "User registered successfully" });
    }
}