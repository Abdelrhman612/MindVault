using backend.DataBase.Models;
using backend.DTOs;
using backend.Interfaces.IRepositories;
using backend.Interfaces.IServices;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services;

public class AuthService(IUserRepository userRepository, IConfiguration configuration) : IAuthService
{

    public async Task<string> SignUpAsync(UserRegisterDto registerDto)
    {
        if (await userRepository.ExistsAsync(registerDto.Email))
        {
            throw new Exception("User with this email already exists.");
        }

        var user = new User
        {
            Name = registerDto.Name,
            Email = registerDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
        };

        await userRepository.AddAsync(user);
        await userRepository.SaveChangesAsync();

        return "User registered successfully.";
    }

    public async Task<string?> SignInAsync(UserLoginDto loginDto)
    {
        var user = await userRepository.GetByEmailAsync(loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
        {
            return null;
        }

        return CreateToken(user);
    }

    private string CreateToken(User user)
    {
        List<Claim> claims = [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Name)
        ];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            configuration.GetSection("Jwt:Key").Value!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

        var token = new JwtSecurityToken(
            issuer: configuration.GetSection("Jwt:Issuer").Value,
            audience: configuration.GetSection("Jwt:Audience").Value,
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
