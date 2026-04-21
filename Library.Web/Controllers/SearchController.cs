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
            var result = await _service.GlobalSearchAsync(query);
            return Ok(result);
        }
    }
}
