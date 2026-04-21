using Library.Web.DTO;
using Library.Web.DTO.Authors;
using Library.Web.DTO.Books;
using Library.Web.DTO.Genres;
using Library.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        private readonly SearchService _service;

        public SearchController(SearchService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Search(string query)
        {
            var (books, authors, genres) = await _service.GlobalSearchAsync(query);

            var result = new SearchResultDto
            {
                Books = books.Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title
                }).ToList(),

                Authors = authors.Select(a => new AuthorDto
                {
                    Id = a.Id,
                    Name = a.Name
                }).ToList(),

                Genres = genres.Select(g => new GenreDto
                {
                    Id = g.Id,
                    Name = g.Name
                }).ToList()
            };

            return Ok(result);
        }
    }
}
