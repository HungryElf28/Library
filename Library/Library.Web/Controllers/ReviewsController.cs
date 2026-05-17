using Library.Application.Services;
using Library.Web.DTO.Common;
using Library.Web.DTO.Reviews;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _service;

        public ReviewsController(ReviewService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("{bookId}")]
        public async Task<IActionResult> Add(int bookId, CreateReviewDto dto)
        {
            if (dto.Rate < 0 || dto.Rate > 5)
                return BadRequest();

            var userId = User.GetUserId();

            await _service.AddOrUpdate(userId, bookId, dto.Rate, dto.Text);

            return Ok();
        }

        [HttpGet("{bookId}")]
        public async Task<IActionResult> Get(int bookId, [FromQuery] PaginationQueryDto query)
        {
            var page = query.NormalizedPage;
            var pageSize = query.NormalizedPageSize;
            var reviews = await _service.GetByBook(bookId);

            int? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                try
                {
                    currentUserId = User.GetUserId();
                }
                catch { }
            }

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                reviews = reviews
                    .Where(r => r.Text?.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) == true)
                    .ToList();
            }

            var total = reviews.Count;
            var items = reviews
                .OrderByDescending(r => currentUserId.HasValue && r.UserId == currentUserId.Value)
                .ThenByDescending(r => r.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    userName = r.UserName,
                    userAvatar = r.UserAvatar,
                    r.BookId,
                    r.Rate,
                    text = r.Text
                });

            return Ok(PagedResponseDto<object>.Create(items, total, page, pageSize));
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var review = await _service.GetById(id);
            if (review == null) return NotFound();

            var currentUserId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            if (!isAdmin && review.UserId != currentUserId)
            {
                return Forbid();
            }

            await _service.Delete(id);
            return Ok();
        }
    }
}
