using Library.Domain.Entities;
using Library.Domain.Interfaces;

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

        public async Task<Review?> GetById(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task Delete(int id)
        {
            var review = await _repo.GetByIdAsync(id);

            if (review == null)
                throw new Exception("Review not found");

            await _repo.DeleteAsync(id);
        }
    }
}
