using Library.Application.Services;
using Library.Web.DTO.Reviews;
using Library.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        public async Task<IActionResult> Get(int bookId)
        {
            var reviews = await _service.GetByBook(bookId);

            var result = reviews.Select(r => new
            {
                r.UserId,
                r.Rate,
                r.Text
            });

            return Ok(result);
        }
    }
}
