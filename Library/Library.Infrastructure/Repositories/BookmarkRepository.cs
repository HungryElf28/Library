using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

namespace Library.Infrastructure.Repositories;

public class BookmarkRepository : IBookmarkRepository
{
    private readonly LibraryDbContext _context;

    public BookmarkRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<List<Bookmark>> GetByBookIdAsync(int userId, int bookId)
    {
        var efBookmarks = await _context.Bookmarks
            .Where(b => b.UserId == userId && b.BookId == bookId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return efBookmarks.Select(BookmarkMapper.ToDomain).ToList();
    }

    public async Task<Bookmark> AddAsync(Bookmark bookmark)
    {
        var ef = BookmarkMapper.ToEf(bookmark);
        _context.Bookmarks.Add(ef);
        await _context.SaveChangesAsync();
        return BookmarkMapper.ToDomain(ef);
    }

    public async Task UpdateAsync(Bookmark bookmark)
    {
        var ef = await _context.Bookmarks.FindAsync(bookmark.Id);
        if (ef == null) throw new Exception("Bookmark not found");

        ef.Note = bookmark.Note;
        ef.Page = bookmark.Page;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var ef = await _context.Bookmarks.FindAsync(id);
        if (ef != null)
        {
            _context.Bookmarks.Remove(ef);
            await _context.SaveChangesAsync();
        }
    }
}
