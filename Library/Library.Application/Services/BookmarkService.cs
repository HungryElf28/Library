using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services
{
    public class BookmarkService
    {
        private readonly IBookmarkRepository _repo;

        public BookmarkService(IBookmarkRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Bookmark>> GetByBookIdAsync(int userId, int bookId)
        {
            return await _repo.GetByBookIdAsync(userId, bookId);
        }

        public async Task<Bookmark> AddAsync(int userId, int bookId, int page, string? cfi, int? charOffset, string? note)
        {
            var bookmark = new Bookmark(0, userId, bookId, page, cfi, charOffset, note, DateTime.UtcNow);
            return await _repo.AddAsync(bookmark);
        }

        public async Task UpdateAsync(int id, string? note)
        {
            var bookmark = new Bookmark(id, 0, 0, 0, null, null, note, DateTime.UtcNow);
            await _repo.UpdateAsync(bookmark);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
    }
}
