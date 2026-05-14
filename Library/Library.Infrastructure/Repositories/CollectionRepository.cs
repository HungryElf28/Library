using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Library.Infrastructure.Repositories
{
    public class CollectionRepository: ICollectionRepository
    {
        private readonly LibraryDbContext _context;

        public CollectionRepository(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<List<Collection>> GetByUserIdAsync(int userId)
        {
            var collections = await _context.Collections
                .Include(c => c.Books)
                    .ThenInclude(b => b.Authors)
                .Include(c => c.Books)
                    .ThenInclude(b => b.Genres)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return collections.Select(ToDomain).ToList();
        }

        public async Task<Collection?> GetByIdAsync(int id)
        {
            var ef = await _context.Collections
                .Include(c => c.Books)
                    .ThenInclude(b => b.Authors)
                .Include(c => c.Books)
                    .ThenInclude(b => b.Genres)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (ef == null) return null;

            return ToDomain(ef);
        }

        public async Task AddAsync(Collection collection)
        {
            var ef = new Data.Models.Collection
            {
                Title = collection.Title,
                UserId = collection.UserId
            };

            _context.Collections.Add(ef);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Collection collection)
        {
            var ef = await _context.Collections.FindAsync(collection.Id);

            if (ef == null)
                throw new Exception("Not found");

            ef.Title = collection.Title;
            await _context.SaveChangesAsync();
        }

        public async Task AddBookAsync(int collectionId, int bookId)
        {
            var collection = await _context.Collections
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == collectionId);

            var book = await _context.Books.FindAsync(bookId);

            if (collection == null || book == null)
                throw new Exception("Not found");

            if (!collection.Books.Any(b => b.Id == bookId))
                collection.Books.Add(book);

            await _context.SaveChangesAsync();
        }

        public async Task RemoveBookAsync(int collectionId, int bookId)
        {
            var collection = await _context.Collections
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == collectionId);

            if (collection == null)
                throw new Exception("Not found");

            var book = collection.Books.FirstOrDefault(b => b.Id == bookId);

            if (book != null)
                collection.Books.Remove(book);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var collection = await _context.Collections.FindAsync(id);

            if (collection == null)
                throw new Exception("Not found");

            _context.Collections.Remove(collection);
            await _context.SaveChangesAsync();
        }

        private static Collection ToDomain(Data.Models.Collection ef)
        {
            var collection = new Collection(ef.Id, ef.Title, ef.UserId);

            collection.Books.AddRange(
                ef.Books.Select(b =>
                {
                    var book = new Book(b.Id, b.Title, b.TextFile, b.CoverFile, b.Description);
                    book.Authors.AddRange(b.Authors.Select(a => new Author(a.Id, a.Name, a.Bio, a.Photo)));
                    book.Genres.AddRange(b.Genres.Select(g => new Genre(g.Id, g.Name)));
                    return book;
                })
            );

            return collection;
        }

    }
}
