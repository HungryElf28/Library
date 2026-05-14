using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IBookRepository
    {
        Task<List<Book>> GetAllAsync();
        Task<Book?> GetByIdAsync(int id);
        Task<Book> AddAsync(Book book);
        Task UpdateAsync(Book newBook);
        Task DeleteAsync(int id);
        Task<List<SearchProjection>> SearchAsync(string query);
        Task<(List<Book> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int? genreId, int? authorId, int? tagId, int page, int pageSize, BookSortBy sortBy, BookSortOrder sortOrder);
        Task<List<Book>> GetRecommendationsAsync(int userId, List<int> authorIds, List<int> genreIds, List<int> tagIds, List<int> excludeBookIds);
        Task<List<Book>> GetMostReadBooksAsync(int count, int? genreId = null, int? authorId = null);
    }
}
