using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using KaraokeManagement.API.Data;
using KaraokeManagement.API.DTOs;
using KaraokeManagement.API.Models;

namespace KaraokeManagement.API.Services;

public class AuthService : IAuthService
{
    private readonly KaraokeDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(KaraokeDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> Login(LoginDto loginDto)
    {
        // Find user by username
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null)
            return null;

        // Verify password
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        
        if (!isPasswordValid)
            return null;

        // Generate JWT token
        var token = GenerateJwtToken(user.Username, user.Role.ToString());

        return new LoginResponseDto(
            Token: token,
            Username: user.Username,
            Role: user.Role.ToString()
        );
    }

    public async Task<bool> Register(RegisterUserDto registerDto)
    {
        // Check if username already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == registerDto.Username);

        if (existingUser != null)
            return false;

        // Parse role
        if (!Enum.TryParse<UserRole>(registerDto.Role, out var role))
            return false;

        // Hash password
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Create new user
        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = passwordHash,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public string GenerateJwtToken(string username, string role)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]!);

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}