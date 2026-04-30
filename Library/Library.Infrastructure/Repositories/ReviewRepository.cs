using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Library.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly LibraryDbContext _context;

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
                .Where(r => r.BookId == bookId)
                .Select(r => new Review(
                    r.Id,
                    r.UserId,
                    r.BookId,
                    r.Rate,
                    r.ReviewText
                ))
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int bookId)
        {
            return await _context.Reviews
                .Where(r => r.BookId == bookId)
                .AverageAsync(r => (double?)r.Rate) ?? 0;
        }
    }
}
