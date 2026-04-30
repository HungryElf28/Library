using Library.Application.Services;
using Library.Web.DTO.Collections;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Library.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CollectionsController : ControllerBase
    {
        private readonly CollectionService _service;

        public CollectionsController(CollectionService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetMy()
        {
            var userId = User.GetUserId();

            var collections = await _service.GetUserCollections(userId);

            return Ok(collections.Select(c => new
            {
                c.Id,
                c.Title
            }));
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(CreateCollectionDto dto)
        {
            var userId = User.GetUserId();

            await _service.Create(dto.Title, userId);

            return Ok();
        }

        [Authorize]
        [HttpPost("{id}/books/{bookId}")]
        public async Task<IActionResult> AddBook(int id, int bookId)
        {
            var userId = User.GetUserId();

            await _service.AddBook(id, bookId, userId);

            return Ok();
        }

        [Authorize]
        [HttpDelete("{id}/books/{bookId}")]
        public async Task<IActionResult> RemoveBook(int id, int bookId)
        {
            var userId = User.GetUserId();
            await _service.RemoveBook(id, bookId, userId);
            return Ok();
        }


    }
}
