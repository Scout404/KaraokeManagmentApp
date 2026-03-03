using KaraokeManagement.API.DTOs;

namespace KaraokeManagement.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> Login(LoginDto loginDto);
    Task<bool> Register(RegisterUserDto registerDto);
    string GenerateJwtToken(string username, string role);
}
