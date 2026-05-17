using Library.Application.Services;
using Library.Web.DTO.Auth;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
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
            try
            {
                var result = await _service.RegisterAsync(dto.Login, dto.Email, dto.Password, dto.BirthDate);
                return Ok(new
                {
                    token = result.token,
                    user = new
                    {
                        id = result.user.Id,
                        login = result.user.Login,
                        email = result.user.Email,
                        avatarFile = result.user.AvatarFile,
                        birthDate = result.user.BirthDate,
                        role = result.user.RoleName.ToLower() == "admin" ? "admin" : "client",
                        isSubscribed = result.user.IsSubscribed,
                        subscriptionExpiresAt = result.user.SubscriptionExpiresAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
                    avatarFile = auth.user.AvatarFile,
                    birthDate = auth.user.BirthDate,
                    role = auth.user.RoleName.ToLower() == "admin" ? "admin" : "client",
                    isSubscribed = auth.user.IsSubscribed,
                    subscriptionExpiresAt = auth.user.SubscriptionExpiresAt
                }
            });
        }

        [Authorize]
        [HttpPost("update-account")]
        public async Task<IActionResult> UpdateAccount(UpdateAccountDto dto)
        {
            try
            {
                var userId = User.GetUserId();
                var user = await _service.UpdateAccountAsync(userId, dto.Login, dto.Email, dto.CurrentPassword, dto.NewPassword, dto.BirthDate);
                
                return Ok(new
                {
                    id = user.Id,
                    login = user.Login,
                    email = user.Email,
                    avatarFile = user.AvatarFile,
                    birthDate = user.BirthDate,
                    role = user.RoleName.ToLower() == "admin" ? "admin" : "client",
                    isSubscribed = user.IsSubscribed,
                    subscriptionExpiresAt = user.SubscriptionExpiresAt
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
                avatarFile = user.AvatarFile,
                birthDate = user.BirthDate,
                role = user.RoleName.ToLower() == "admin" ? "admin" : "client",
                isSubscribed = user.IsSubscribed,
                subscriptionExpiresAt = user.SubscriptionExpiresAt
            });
        }
    }
}
