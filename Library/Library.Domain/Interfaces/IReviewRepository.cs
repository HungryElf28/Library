using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IReviewRepository
    {
        Task AddOrUpdateAsync(Review review);

        Task<List<Review>> GetByBookIdAsync(int bookId);

        Task<double> GetAverageRatingAsync(int bookId);

        Task<Review?> GetByIdAsync(int id);

        Task DeleteAsync(int id);
    }
}
