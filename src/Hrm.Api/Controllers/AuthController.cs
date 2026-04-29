using Hrm.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hrm.Api.Controllers
{
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
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.Login(request.Username, request.Password);
            if (token == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            var user = await _authService.GetUserByUsername(request.Username);

            return Ok(new
            {
                Token = token,
                User = new
                {
                    user?.Id,
                    user?.Username,
                    FullName = user?.Employee?.FullName ?? user?.Username,
                    user?.Role,
                    user?.Email
                }
            });
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
