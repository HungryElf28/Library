using Library.Web.DTO.Authors;
using Library.Web.DTO.Books;
using Library.Web.DTO.Genres;

namespace Library.Web.DTO
{
    public class SearchResultDto
    {
        public List<BookDto> Books { get; set; } = new();
        public List<AuthorDto> Authors { get; set; } = new();
        public List<GenreDto> Genres { get; set; } = new();
    }
}
