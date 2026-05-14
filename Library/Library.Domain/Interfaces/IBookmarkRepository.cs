using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IBookmarkRepository
    {
        Task<List<Bookmark>> GetByBookIdAsync(int userId, int bookId);
        Task<Bookmark> AddAsync(Bookmark bookmark);
        Task UpdateAsync(Bookmark bookmark);
        Task DeleteAsync(int id);
    }
}
