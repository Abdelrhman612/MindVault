using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Interfaces.IServices;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] UserRegisterDto registerDto)
    {
        try
        {
            var result = await _authService.SignUpAsync(registerDto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] UserLoginDto loginDto)
    {
        var token = await _authService.SignInAsync(loginDto);

        if (token == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(new { token });
    }
}
