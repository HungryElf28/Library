using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services
{
    public class BookService
    {
        private readonly IBookRepository _repo;

        public BookService(IBookRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Book>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<Book> AddAsync(Book book)
        {
            return await _repo.AddAsync(book);
        }

        public async Task UpdateAsync(Book book)
        {
            await _repo.UpdateAsync(book);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
        public async Task<(List<Book>, int)> GetPaged(string? searchTerm, int? genreId, int? authorId, int? tagId, int page, int pageSize, BookSortBy sortBy, BookSortOrder sortOrder)
        {
            return await _repo.GetPagedAsync(searchTerm, genreId, authorId, tagId, page, pageSize, sortBy, sortOrder);
        }

        public async Task<List<Book>> GetRecommendationsAsync(int userId, IUserRepository userRepo)
        {
            var favorites = await userRepo.GetFavoritesAsync(userId);
            var readingProjections = await userRepo.GetReadingAsync(userId);

            var readingBooks = new List<Book>();
            foreach (var r in readingProjections)
            {
                var b = await _repo.GetByIdAsync(r.BookId);
                if (b != null) readingBooks.Add(b);
            }

            var allKnownBooks = favorites.Concat(readingBooks).ToList();

            var authorIds = allKnownBooks.SelectMany(b => b.Authors).Select(a => a.Id).Distinct().ToList();
            var genreIds = allKnownBooks.SelectMany(b => b.Genres).Select(g => g.Id).Distinct().ToList();
            var tagIds = allKnownBooks.SelectMany(b => b.Tags).Select(t => t.Id).Distinct().ToList();
            var excludeIds = allKnownBooks.Select(b => b.Id).Distinct().ToList();

            var recommendations = await _repo.GetRecommendationsAsync(userId, authorIds, genreIds, tagIds, excludeIds);

            if (recommendations.Count == 0)
            {
                recommendations = await _repo.GetMostReadBooksAsync(15);
                recommendations = recommendations.Where(b => !excludeIds.Contains(b.Id)).ToList();
            }

            return recommendations;
        }

        public async Task<List<Book>> GetMostReadAsync(int count, int? genreId = null, int? authorId = null)
        {
            return await _repo.GetMostReadBooksAsync(count, genreId, authorId);
        }

        public void DeleteFileIfExists(string? fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return;

            try
            {
                var uri = new Uri(fileUrl);
                var fileName = Path.GetFileName(uri.LocalPath);
                var path = Path.Combine("wwwroot/uploads", fileName);

                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
            catch
            {
            }
        }

    }
}
