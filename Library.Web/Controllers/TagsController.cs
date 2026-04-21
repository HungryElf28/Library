using Library.Application.Services;
using Library.Web.DTO.Tags;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Library.Web.DTO.Genres;

namespace Library.Web.Controllers
{
    [ApiController]
    [Route("api/tags")]
    public class TagsController : ControllerBase
    {
        private readonly TagService _service;

        public TagsController(TagService service)
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
            var tag = await _service.GetByIdAsync(id);

            if (tag == null)
                return NotFound();

            return Ok(tag);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTagDto dto)
        {
            var tag = new Tag(0, dto.Name);

            await _service.AddAsync(tag);

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTagDto dto)
        {
            var tag = new Tag(
                id,
                dto.Name
            );

            await _service.UpdateAsync(tag);
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
