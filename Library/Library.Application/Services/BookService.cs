using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Application.Common.Enums;

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
        public async Task<(List<Book>, int)> GetPaged(int? genreId, int? authorId, int page, int pageSize, BookSortBy sortBy, BookSortOrder sortOrder)
        {
            return await _repo.GetPagedAsync(genreId, authorId, page, pageSize, sortBy, sortOrder);
        }

        public async Task<List<Book>> GetRecommendationsAsync(int userId, IUserRepository userRepo)
        {
            var favorites = await userRepo.GetFavoritesAsync(userId);
            if (!favorites.Any())
            {
                // Return top rated or latest if no favorites
                var (items, _) = await _repo.GetPagedAsync(null, null, 1, 10, BookSortBy.Rate, BookSortOrder.Desc);
                return items;
            }

            var favoriteGenreIds = favorites.SelectMany(b => b.Genres).Select(g => g.Id).Distinct().ToList();
            
            var recommendations = new List<Book>();
            foreach (var genreId in favoriteGenreIds)
            {
                var (items, _) = await _repo.GetPagedAsync(genreId, null, 1, 5, BookSortBy.Rate, BookSortOrder.Desc);
                recommendations.AddRange(items);
            }

            return recommendations
                .Where(r => !favorites.Any(f => f.Id == r.Id))
                .DistinctBy(b => b.Id)
                .Take(10)
                .ToList();
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
        // можно залогировать, но не падать
    }
}

    }
}
