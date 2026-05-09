using Library.Application.Services;
using Library.Web.DTO.Auth;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Library.Web.Extensions;
namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController: ControllerBase
    {
        private readonly AuthService _service;
        private readonly UserService _userService;

        public AuthController(AuthService service, UserService userService)
        {
            _service = service;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _service.RegisterAsync(dto.Login, dto.Email, dto.Password);
            return Ok(new 
            { 
                token = result.token, 
                user = new 
                {
                    id = result.user.Id,
                    login = result.user.Login,
                    email = result.user.Email,
                    role = result.user.RoleName.ToLower() == "admin" ? "admin" : "client"
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _service.LoginAsync(dto.Login, dto.Password);

            if (result == null)
                return Unauthorized();

            var auth = result.Value;
            return Ok(new 
            { 
                token = auth.token, 
                user = new 
                {
                    id = auth.user.Id,
                    login = auth.user.Login,
                    email = auth.user.Email,
                    role = auth.user.RoleName.ToLower() == "admin" ? "admin" : "client"
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.GetUserId();
            var user = await _userService.GetByIdAsync(userId);
            if (user == null) return NotFound();

            return Ok(new 
            { 
                id = user.Id,
                login = user.Login,
                email = user.Email,
                role = user.RoleName.ToLower() == "admin" ? "admin" : "client"
            });
        }
    }
}
