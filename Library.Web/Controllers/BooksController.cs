using Library.Application.Services;
using Library.Web.DTO.Books;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var books = await _service.GetAllAsync();

            var result = books.Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                CoverFile = b.CoverFile,
                Authors = b.Authors.Select(a => a.Name).ToList()
            });

            return Ok(result);
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
        public async Task<IActionResult> Create(CreateBookDto dto)
        {
            var book = new Book(
                0,
                dto.Title,
                dto.TextFile,
                dto.CoverFile,
                dto.Description
            );

            await _service.AddAsync(book);

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateBookDto dto)
        {
            var book = new Book(
                id,
                dto.Title,
                dto.TextFile,
                dto.CoverFile,
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
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
