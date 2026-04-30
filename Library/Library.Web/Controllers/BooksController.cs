using Library.Application.Services;
using Library.Web.DTO.Books;
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
                Authors = book.Authors.Select(a => a.Name).ToList(),
                Genres = book.Genres.Select(g => g.Name).ToList(),
                Tags = book.Tags.Select(t => t.Name).ToList()
            };

            return Ok(result);
        }

[HttpPost]
public async Task<IActionResult> Create([FromForm] CreateBookDto dto)
{
    string? coverUrl = null;
    string? textUrl = null;

    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");

    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
    }

    if (dto.CoverFile != null)
    {
        var fileName = Guid.NewGuid() + Path.GetExtension(dto.CoverFile.FileName);
        var path = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.CoverFile.CopyToAsync(stream);
        }

        coverUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    }

    if (dto.TextFile != null)
    {
        var fileName = Guid.NewGuid() + Path.GetExtension(dto.TextFile.FileName);
        var path = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.TextFile.CopyToAsync(stream);
        }

        textUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    }

    var book = new Book(
        0,
        dto.Title,
        textUrl,
        coverUrl,
        dto.Description
    );

    book.Authors.AddRange(dto.AuthorIds.Select(id => new Author(id, "", "", "")));
    book.Genres.AddRange(dto.GenreIds.Select(id => new Genre(id, "")));
    book.Tags.AddRange(dto.TagIds.Select(id => new Tag(id, "")));

    await _service.AddAsync(book);

    return Ok();
}

[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, [FromForm] UpdateBookDto dto)
{
    var existing = await _service.GetByIdAsync(id);
    if (existing == null)
        return NotFound();

    string? coverUrl = existing.CoverFile;
    string? textUrl = existing.TextFile;

    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");

    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
    }


    if (dto.CoverFile != null)
    {
        _service.DeleteFileIfExists(existing.CoverFile);

        var fileName = Guid.NewGuid() + Path.GetExtension(dto.CoverFile.FileName);
        var path = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.CoverFile.CopyToAsync(stream);
        }

        coverUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    }

    if (dto.TextFile != null)
    {
        _service.DeleteFileIfExists(existing.TextFile);

        var fileName = Guid.NewGuid() + Path.GetExtension(dto.TextFile.FileName);
        var path = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.TextFile.CopyToAsync(stream);
        }

        textUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    }

    var book = new Book(
        id,
        dto.Title,
        textUrl,
        coverUrl,
        dto.Description
    );

    book.Authors.AddRange(dto.AuthorIds.Select(id => new Author(id, "", "", "")));
    book.Genres.AddRange(dto.GenreIds.Select(id => new Genre(id, "")));
    book.Tags.AddRange(dto.TagIds.Select(id => new Tag(id, "")));

    await _service.UpdateAsync(book);

    return Ok();
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
    }
}
