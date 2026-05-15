using Library.Application.Services;
using Library.Web.DTO.Common;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetFavorites([FromQuery] PaginationQueryDto query)
        {
            var userId = User.GetUserId();
            var page = query.NormalizedPage;
            var pageSize = query.NormalizedPageSize;

            var books = await _service.GetFavorites(userId);
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                books = books
                    .Where(b =>
                        b.Title.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                        b.Authors.Any(a => a.Name.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            var total = books.Count;
            var items = books
                .OrderBy(b => b.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.CoverFile,
                    Authors = b.Authors.Select(a => a.Name).ToList(),
                    Genres = b.Genres.Select(g => g.Name).ToList()
                });

            return Ok(PagedResponseDto<object>.Create(items, total, page, pageSize));
        }

        [Authorize]
        [HttpGet("reading")]
        public async Task<IActionResult> GetReading([FromQuery] PaginationQueryDto query)
        {
            var userId = User.GetUserId();
            var page = query.NormalizedPage;
            var pageSize = query.NormalizedPageSize;

            var books = await _service.GetReading(userId);
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                books = books
                    .Where(b => b.Title.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            var total = books.Count;
            var items = books
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.BookId,
                    b.Title,
                    b.CoverFile,
                    b.Page,
                    b.TotalPages,
                    b.LastOpened,
                    Progress = b.TotalPages > 0 ? (int)Math.Round((double)b.Page / b.TotalPages * 100) : 0
                });

            return Ok(PagedResponseDto<object>.Create(items, total, page, pageSize));
        }

        [Authorize]
        [HttpPost("reading/{bookId}")]
        public async Task<IActionResult> SaveProgress(int bookId, [FromBody] ReadingProgressDto dto)
        {
            var userId = User.GetUserId();
            await _service.SaveProgress(userId, bookId, dto.Page, dto.CharOffset, dto.TotalPages);
            return Ok();
        }

        [Authorize]
        [HttpGet("reading/{bookId}")]
        public async Task<IActionResult> GetProgress(int bookId)
        {
            var userId = User.GetUserId();
            var progress = await _service.GetProgress(userId, bookId);
            return Ok(progress);
        }

        [Authorize]
        [HttpPost("subscription")]
        public async Task<IActionResult> UpdateSubscription([FromBody] bool isSubscribed)
        {
            var userId = User.GetUserId();
            var expiresAt = isSubscribed ? DateTime.UtcNow.AddMonths(1) : (DateTime?)null;
            await _service.UpdateSubscription(userId, isSubscribed, expiresAt);
            return Ok();
        }

        [Authorize]
        [HttpPost("avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile file)
        {
            if (file == null) return BadRequest("No file uploaded");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension)) return BadRequest("Invalid file type");

            var userId = User.GetUserId();
            var user = await _service.GetByIdAsync(userId);
            if (user == null) return NotFound();

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"avatar_{userId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var avatarUrl = $"/uploads/{fileName}";

            if (!string.IsNullOrEmpty(user.AvatarFile))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarFile.TrimStart('/'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            await _service.UpdateAvatar(userId, avatarUrl);
            return Ok(new { avatarUrl });
        }

        [Authorize]
        [HttpDelete("avatar")]
        public async Task<IActionResult> DeleteAvatar()
        {
            var userId = User.GetUserId();
            var user = await _service.GetByIdAsync(userId);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(user.AvatarFile))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarFile.TrimStart('/'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);

                await _service.UpdateAvatar(userId, null);
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}/avatar")]
        public async Task<IActionResult> DeleteUserAvatar(int id)
        {
            if (!User.IsAdmin()) return Forbid();

            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(user.AvatarFile))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarFile.TrimStart('/'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);

                await _service.UpdateAvatar(id, null);
            }

            return NoContent();
        }

        [Authorize]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers([FromQuery] PaginationQueryDto query)
        {
            if (!User.IsAdmin()) return Forbid();

            var page = query.NormalizedPage;
            var pageSize = query.NormalizedPageSize;
            var users = await _service.GetAllUsers();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                users = users
                    .Where(u =>
                        u.Login.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                        u.Email.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                        u.RoleName.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            var total = users.Count;
            var items = users
                .OrderBy(u => u.Login)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.Login,
                    u.Email,
                    u.AvatarFile,
                    role = u.RoleName.ToLower() == "admin" ? "admin" : "client",
                    u.IsSubscribed,
                    u.SubscriptionExpiresAt
                });

            return Ok(PagedResponseDto<object>.Create(items, total, page, pageSize));
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (!User.IsAdmin() && User.GetUserId() != id) return Forbid();
            await _service.DeleteUser(id);
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] string roleName)
        {
            if (!User.IsAdmin()) return Forbid();
            await _service.ChangeRole(id, roleName);
            return Ok();
        }
    }

    public class ReadingProgressDto
    {
        public int Page { get; set; }
        public int? CharOffset { get; set; }
        public int TotalPages { get; set; }
    }
}
