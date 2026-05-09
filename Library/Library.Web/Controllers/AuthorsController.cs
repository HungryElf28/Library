using Library.Application.Services;
using Library.Web.DTO.Authors;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Library.Web.DTO.Books;
using Library.Web.Extensions;

namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/authors")]
    public class AuthorsController : ControllerBase
    {
        private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        };

        private readonly AuthorService _service;

        public AuthorsController(AuthorService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var author = await _service.GetByIdAsync(id);

            if (author == null)
                return NotFound();

            return Ok(author);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateAuthorDto dto)
        {
            string? photoUrl = null;
            if (dto.PhotoFile != null)
            {
                if (!IsAllowedExtension(dto.PhotoFile, AllowedImageExtensions))
                    return BadRequest("Unsupported image file extension.");

                var uploadsPath = EnsureUploadsPath();
                photoUrl = await SaveUploadedFile(dto.PhotoFile, uploadsPath);
            }

            var author = new Author(0, dto.Name, dto.Bio, photoUrl);
            var created = await _service.AddAsync(author);

            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateAuthorDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            string? photoUrl = existing.Photo;
            if (dto.PhotoFile != null)
            {
                if (!IsAllowedExtension(dto.PhotoFile, AllowedImageExtensions))
                    return BadRequest("Unsupported image file extension.");

                var uploadsPath = EnsureUploadsPath();
                photoUrl = await SaveUploadedFile(dto.PhotoFile, uploadsPath);
                
                // Delete old photo if it was a local file
                DeleteFileIfExists(existing.Photo);
            }

            var author = new Author(
                id,
                dto.Name,
                dto.Bio,
                photoUrl
            );

            await _service.UpdateAsync(author);

            var updated = await _service.GetByIdAsync(id);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing != null)
            {
                DeleteFileIfExists(existing.Photo);
            }

            await _service.DeleteAsync(id);
            return NoContent();
        }

        private string EnsureUploadsPath()
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsPath);
            return uploadsPath;
        }

        private static bool IsAllowedExtension(IFormFile file, HashSet<string> allowedExtensions)
        {
            return allowedExtensions.Contains(Path.GetExtension(file.FileName));
        }

        private async Task<string> SaveUploadedFile(IFormFile file, string uploadsPath)
        {
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
            var path = Path.Combine(uploadsPath, fileName);

            await using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        }

        private void DeleteFileIfExists(string? fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return;

            try
            {
                var uri = new Uri(fileUrl);
                var fileName = Path.GetFileName(uri.LocalPath);
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
            catch
            {
            }
        }
    }
}
