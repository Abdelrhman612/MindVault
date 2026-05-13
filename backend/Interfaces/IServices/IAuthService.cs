using backend.DTOs;

namespace backend.Interfaces.IServices;

public interface IAuthService
{
    Task<string> SignUpAsync(UserRegisterDto registerDto);
    Task<string?> SignInAsync(UserLoginDto loginDto);
}
