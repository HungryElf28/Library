using Library.Application.Services;
using Library.Web.DTO.Authors;
using Library.Web.DTO.Books;
using Library.Web.DTO.Genres;
using Library.Web.DTO.Tags;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Library.Web.Extensions;

namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/books")]
    public class BooksController : ControllerBase
    {
        private static readonly HashSet<string> AllowedBookExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".epub",
            ".fb2",
            ".txt",
            ".rtf",
            ".pdf",
            ".mobi",
            ".azw3"
        };

        private static readonly HashSet<string> AllowedCoverExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        };

        private readonly BookService _service;

        public BooksController(BookService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var book = await _service.GetByIdAsync(id);

            if (book == null)
                return NotFound();

            var result = new BookDetailsDto
            {
                Id = book.Id,
                Title = book.Title,
                TextFile = book.TextFile,
                CoverFile = book.CoverFile,
                Description = book.Description,
                Authors = book.Authors.Select(a => new AuthorDto { Id = a.Id, Name = a.Name }).ToList(),
                Genres = book.Genres.Select(g => new GenreDto { Id = g.Id, Name = g.Name }).ToList(),
                Tags = book.Tags.Select(t => new TagDto { Id = t.Id, Name = t.Name }).ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateBookDto dto)
        {
            if (dto.TextFile == null)
                return BadRequest("Book file is required.");
            if (!IsAllowedExtension(dto.TextFile, AllowedBookExtensions))
                return BadRequest("Unsupported book file extension.");
            if (dto.CoverFile != null && !IsAllowedExtension(dto.CoverFile, AllowedCoverExtensions))
                return BadRequest("Unsupported cover file extension.");

            var uploadsPath = EnsureUploadsPath();
            var textUrl = await SaveUploadedFile(dto.TextFile, uploadsPath);
            var coverUrl = dto.CoverFile == null
                ? null
                : await SaveUploadedFile(dto.CoverFile, uploadsPath);

            var book = BuildBook(0, dto.Title, textUrl, coverUrl, dto.Description, dto.AuthorIds, dto.GenreIds, dto.TagIds);

            await _service.AddAsync(book);

            return Ok(new { book.Title, book.TextFile, book.CoverFile, book.Description });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateBookDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            var uploadsPath = EnsureUploadsPath();
            var coverUrl = existing.CoverFile;
            var textUrl = existing.TextFile;

            if (dto.CoverFile != null)
            {
                if (!IsAllowedExtension(dto.CoverFile, AllowedCoverExtensions))
                    return BadRequest("Unsupported cover file extension.");

                coverUrl = await SaveUploadedFile(dto.CoverFile, uploadsPath);
                _service.DeleteFileIfExists(existing.CoverFile);
            }

            if (dto.TextFile != null)
            {
                if (!IsAllowedExtension(dto.TextFile, AllowedBookExtensions))
                    return BadRequest("Unsupported book file extension.");

                textUrl = await SaveUploadedFile(dto.TextFile, uploadsPath);
                _service.DeleteFileIfExists(existing.TextFile);
            }

            var book = BuildBook(id, dto.Title, textUrl, coverUrl, dto.Description, dto.AuthorIds, dto.GenreIds, dto.TagIds);

            await _service.UpdateAsync(book);

            return Ok(new { book.Id, book.Title, book.TextFile, book.CoverFile, book.Description });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!User.IsAdmin())
                return Forbid();
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] BookQueryDto query)
        {
            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = Math.Min(query.PageSize, 50);

            var (books, total) = await _service.GetPaged(
                query.GenreId,
                query.AuthorId,
                page,
                pageSize,
                query.SortBy,
                query.SortOrder
            );

            return Ok(new
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Items = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.CoverFile,
                    Authors = b.Authors.Select(a => a.Name).ToList()
                })
            });
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

        private static Book BuildBook(
            int id,
            string title,
            string textUrl,
            string? coverUrl,
            string? description,
            List<int> authorIds,
            List<int> genreIds,
            List<int> tagIds)
        {
            var book = new Book(id, title, textUrl, coverUrl, description);

            book.Authors.AddRange(authorIds.Select(authorId => new Author(authorId, "", "", "")));
            book.Genres.AddRange(genreIds.Select(genreId => new Genre(genreId, "")));
            book.Tags.AddRange(tagIds.Select(tagId => new Tag(tagId, "")));

            return book;
        }
    }
}
