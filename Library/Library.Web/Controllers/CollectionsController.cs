using Library.Application.Services;
using Library.Web.DTO.Collections;
using Library.Web.DTO.Common;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<IActionResult> GetMy([FromQuery] PaginationQueryDto query)
        {
            var userId = User.GetUserId();
            var page = query.NormalizedPage;
            var pageSize = query.NormalizedPageSize;

            var collections = await _service.GetUserCollections(userId);
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                collections = collections
                    .Where(c => c.Title.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            var total = collections.Count;
            var items = collections
                .OrderBy(c => c.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ToResponse);

            return Ok(PagedResponseDto<object>.Create(items, total, page, pageSize));
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var userId = User.GetUserId();
            var collection = await _service.Get(id);

            if (collection == null)
                return NotFound();
            if (collection.UserId != userId)
                return Forbid();

            return Ok(ToResponse(collection));
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
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateCollectionDto dto)
        {
            var userId = User.GetUserId();
            await _service.Update(id, dto.Title, userId);
            return Ok();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.GetUserId();
            await _service.Delete(id, userId);
            return NoContent();
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

        private static object ToResponse(Library.Domain.Entities.Collection collection)
        {
            return new
            {
                collection.Id,
                collection.Title,
                collection.UserId,
                Books = collection.Books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.CoverFile,
                    Authors = b.Authors.Select(a => a.Name).ToList()
                }).ToList()
            };
        }
    }
}
