using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Library.Application.Services;
using Library.Web.Extensions;

namespace Library.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _service;

        public UsersController(UserService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("favorites/{bookId}")]
        public async Task<IActionResult> AddToFavorites(int bookId)
        {
            var userId = User.GetUserId();

            await _service.AddToFavorites(userId, bookId);

            return Ok();
        }

        [Authorize]
        [HttpDelete("favorites/{bookId}")]
        public async Task<IActionResult> RemoveFromFavorites(int bookId)
        {
            var userId = User.GetUserId();

            await _service.RemoveFromFavorites(userId, bookId);

            return NoContent();
        }

        [Authorize]
        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = User.GetUserId();

            var books = await _service.GetFavorites(userId);

            var result = books.Select(b => new
            {
                b.Id,
                b.Title,
                b.CoverFile,
                Authors = b.Authors.Select(a => a.Name)
            });

            return Ok(result);
        }

        [HttpGet("reading")]
        public async Task<IActionResult> GetReading()
        {
            var userId = User.GetUserId();

            var books = await _service.GetReading(userId);

            var result = books.Select(b => new
            {
                b.BookId,
                b.Title,
                b.CoverFile,
                b.Page,
                b.LastOpened
            });

            return Ok(result);
        }
    }
}
