using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IAuthorRepository
    {
        Task<List<Author>> GetAllAsync();
        Task<(List<Author> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize);
        Task<Author?> GetByIdAsync(int id);
        Task<Author> AddAsync(Author author);
        Task<bool> ExistsByNameAsync(string name);
        Task UpdateAsync(Author newAuthor);
        Task DeleteAsync(int id);
        Task<List<SearchProjection>> SearchAsync(string query);
    }
}