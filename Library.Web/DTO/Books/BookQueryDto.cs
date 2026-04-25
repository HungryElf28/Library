using Library.Domain.Entities;
namespace Library.Web.DTO.Books
{
    public class BookQueryDto
    {
        public int? GenreId { get; set; }
        public int? AuthorId { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public BookSortBy SortBy { get; set; } = BookSortBy.Title;
        public BookSortOrder SortOrder { get; set; } = BookSortOrder.Asc;
    }
}
