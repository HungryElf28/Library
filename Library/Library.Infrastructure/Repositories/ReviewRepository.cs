using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Library.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly LibraryDbContext _context;

        public ReviewRepository(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task AddOrUpdateAsync(Review review)
        {
            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.UserId == review.UserId &&
                    r.BookId == review.BookId);

            if (existing == null)
            {
                var ef = new Data.Models.Review
                {
                    UserId = review.UserId,
                    BookId = review.BookId,
                    Rate = review.Rate,
                    ReviewText = review.Text
                };

                _context.Reviews.Add(ef);
            }
            else
            {
                existing.Rate = review.Rate;
                existing.ReviewText = review.Text;
            }

            await _context.SaveChangesAsync();

            await UpdateBookRating(review.BookId);
        }

        private async Task UpdateBookRating(int bookId)
        {
            var avg = await _context.Reviews
                .Where(r => r.BookId == bookId)
                .AverageAsync(r => (double?)r.Rate) ?? 0;

            var book = await _context.Books.FindAsync(bookId);

            if (book != null)
            {
                book.Rating = avg;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Review>> GetByBookIdAsync(int bookId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.BookId == bookId)
                .Select(r => new Review(
                    r.Id,
                    r.UserId,
                    r.BookId,
                    r.Rate,
                    r.ReviewText,
                    r.User.Login,
                    r.User.AvatarFile
                ))
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int bookId)
        {
            return await _context.Reviews
                .Where(r => r.BookId == bookId)
                .AverageAsync(r => (double?)r.Rate) ?? 0;
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            var r = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (r == null) return null;

            return new Review(
                r.Id,
                r.UserId,
                r.BookId,
                r.Rate,
                r.ReviewText,
                r.User.Login,
                r.User.AvatarFile
            );
        }

        public async Task DeleteAsync(int id)
        {
            var r = await _context.Reviews.FindAsync(id);
            if (r != null)
            {
                var bookId = r.BookId;
                _context.Reviews.Remove(r);
                await _context.SaveChangesAsync();
                await UpdateBookRating(bookId);
            }
        }
    }
}
