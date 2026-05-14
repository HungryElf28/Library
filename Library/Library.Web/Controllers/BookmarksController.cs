using Library.Application.Services;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookmarksController : ControllerBase
    {
        private readonly BookmarkService _service;

        public BookmarksController(BookmarkService service)
        {
            _service = service;
        }

        [HttpGet("{bookId}")]
        public async Task<IActionResult> GetByBookId(int bookId)
        {
            var userId = User.GetUserId();
            var bookmarks = await _service.GetByBookIdAsync(userId, bookId);
            return Ok(bookmarks);
        }

        [HttpPost("{bookId}")]
        public async Task<IActionResult> Create(int bookId, [FromBody] CreateBookmarkDto dto)
        {
            var userId = User.GetUserId();
            var bookmark = await _service.AddAsync(userId, bookId, dto.Page, dto.Cfi, dto.CharOffset, dto.Note);
            return Ok(bookmark);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] string? note)
        {
            await _service.UpdateAsync(id, note);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }

    public class CreateBookmarkDto
    {
        public int Page { get; set; }
        public string? Cfi { get; set; }
        public int? CharOffset { get; set; }
        public string? Note { get; set; }
    }
}
