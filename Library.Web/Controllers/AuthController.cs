using Library.Application.Services;
using Library.Web.DTO.Auth;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace Library.Web.Controllers
{
    public class AuthController: ControllerBase
    {
        private readonly AuthService _service;

        public AuthController(AuthService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            await _service.RegisterAsync(dto.Login, dto.Email, dto.Password);
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var token = await _service.LoginAsync(dto.Login, dto.Password);

            if (token == null)
                return Unauthorized();

            return Ok(token);
        }
    }
}
