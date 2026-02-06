namespace KaraokeManagement.API.DTOs;

public record RegisterUserDto(
    string Username,
    string Password,
    string Role // "Admin" or "Worker"
);
