using Library.Web.DTO.Authors;
using Library.Web.DTO.Genres;
using Library.Web.DTO.Tags;

namespace Library.Web.DTO.Books
{
    public class BookDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string TextFile { get; set; } = null!;
        public string? CoverFile { get; set; }
        public string? Description { get; set; }
        public int AgeRestriction { get; set; }
        public double AverageRating { get; set; }
        public int ReviewsCount { get; set; }
        public int ReadCount { get; set; }

        public List<AuthorDto> Authors { get; set; } = new();
        public List<GenreDto> Genres { get; set; }
        public List<TagDto> Tags { get; set; }
    }
}
