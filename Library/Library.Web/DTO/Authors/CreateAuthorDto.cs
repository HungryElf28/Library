using Microsoft.AspNetCore.Http;

namespace Library.Web.DTO.Authors
{
    public class CreateAuthorDto
    {
        public string Name { get; set; }

        public string? Bio { get; set; }

        public IFormFile? PhotoFile { get; set; }
    }
}
