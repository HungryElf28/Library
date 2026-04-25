using Library.Application.Services;
using Library.Web.DTO.Genres;
using Library.Domain.Entities;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Library.Web.DTO.Books;
using Library.Web.Extensions;

namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/genres")]
    public class GenresController : ControllerBase
    {
        private readonly GenreService _service;

        public GenresController(GenreService service)
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
            var genre = await _service.GetByIdAsync(id);

            if (genre == null)
                return NotFound();

            return Ok(genre);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateGenreDto dto)
        {
            var genre = new Genre(0, dto.Name);

            await _service.AddAsync(genre);

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateGenreDto dto)
        {
            var genre = new Genre(
                id,
                dto.Name
            );

            await _service.UpdateAsync(genre);
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
    }
}
