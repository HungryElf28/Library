using Library.Domain.Interfaces;
using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Application.Services
{
    public class ReviewService
    {
        private readonly IReviewRepository _repo;

        public ReviewService(IReviewRepository repo)
        {
            _repo = repo;
        }

        public async Task AddOrUpdate(int userId, int bookId, int rate, string? text)
        {
            var review = new Review(0, userId, bookId, rate, text);

            await _repo.AddOrUpdateAsync(review);
        }

        public async Task<List<Review>> GetByBook(int bookId)
        {
            return await _repo.GetByBookIdAsync(bookId);
        }
    }
}
