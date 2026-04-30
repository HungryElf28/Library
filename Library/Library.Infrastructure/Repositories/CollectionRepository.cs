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
            return await _context.Collections
                .Where(c => c.UserId == userId)
                .Select(c => new Collection(c.Id, c.Title, c.UserId))
                .ToListAsync();
        }

        public async Task<Collection?> GetByIdAsync(int id)
        {
            var ef = await _context.Collections
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (ef == null) return null;

            var collection = new Collection(ef.Id, ef.Title, ef.UserId);

            collection.Books.AddRange(
                ef.Books.Select(b =>
                    new Book(b.Id, b.Title, b.TextFile, b.CoverFile, b.Description)
                )
            );

            return collection;
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


    }
}
