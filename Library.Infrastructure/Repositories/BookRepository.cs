using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

using EfBook = Library.Infrastructure.Data.Models.Book;
namespace Library.Infrastructure.Repositories;

public class BookRepository : IBookRepository
{
    private readonly LibraryDbContext _context;

    public BookRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<List<Book>> GetAllAsync()
    {
        var efBooks = await _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .ToListAsync();

        return efBooks.Select(BookMapper.ToDomain).ToList();
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        var efBook = await _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efBook == null ? null : BookMapper.ToDomain(efBook);
    }

    public async Task AddAsync(Book book)
    {
        var efBook = BookMapper.ToEf(book);

        efBook.Authors = await _context.Authors
        .Where(a => book.Authors.Select(x => x.Id).Contains(a.Id))
        .ToListAsync();

        efBook.Genres = await _context.Genres
            .Where(g => book.Genres.Select(x => x.Id).Contains(g.Id))
            .ToListAsync();

        efBook.Tags = await _context.Tags
            .Where(t => book.Tags.Select(x => x.Id).Contains(t.Id))
            .ToListAsync();

        _context.Books.Add(efBook);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Book newBook)
{
    var oldBook = await _context.Books
        .Include(b => b.Authors)
        .Include(b => b.Genres)
        .Include(b => b.Tags)
        .FirstOrDefaultAsync(b => b.Id == newBook.Id);

    if (oldBook == null)
        throw new Exception("Book not found");

    oldBook.Title = newBook.Title;
    oldBook.TextFile = newBook.TextFile;
    oldBook.CoverFile = newBook.CoverFile;
    oldBook.Description = newBook.Description;

    var authorIds = newBook.Authors.Select(a => a.Id).ToList();
    var authors = await _context.Authors
        .Where(a => authorIds.Contains(a.Id))
        .ToListAsync();

    oldBook.Authors.Clear();
    foreach (var a in authors)
        oldBook.Authors.Add(a);

    var genreIds = newBook.Genres.Select(g => g.Id).ToList();
    var genres = await _context.Genres
        .Where(g => genreIds.Contains(g.Id))
        .ToListAsync();

    oldBook.Genres.Clear();
    foreach (var g in genres)
        oldBook.Genres.Add(g);

    var tagIds = newBook.Tags.Select(t => t.Id).ToList();
    var tags = await _context.Tags
        .Where(t => tagIds.Contains(t.Id))
        .ToListAsync();

    oldBook.Tags.Clear();
    foreach (var t in tags)
        oldBook.Tags.Add(t);

    await _context.SaveChangesAsync();
}

    public async Task DeleteAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            throw new Exception("Book not found");

        book.Authors.Clear();
        book.Genres.Clear();
        book.Tags.Clear();

        book.Bookmarks.Clear();
        book.Reviews.Clear();
        book.ReadingBooks.Clear();

        _context.Books.Remove(book);

        await _context.SaveChangesAsync();
    }

    public async Task<List<SearchProjection>> SearchAsync(string query)
    {
        var terms = query
            .ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var booksQuery = _context.Books.AsQueryable();

        // 🔥 AND логика
        foreach (var term in terms)
        {
            var t = term; // важно для EF

            booksQuery = booksQuery.Where(b =>
                EF.Functions.ILike(b.Title, $"%{t}%") ||
                EF.Functions.TrigramsSimilarity(b.Title, t) > 0.3
            );
        }

        return await booksQuery
            .Select(b => new SearchProjection
            {
                Type = "book",
                Id = b.Id,
                Title = b.Title,

                Score = terms.Sum(t =>
                    EF.Functions.TrigramsSimilarity(b.Title, t)
                ) + (EF.Functions.ILike(b.Title, $"%{query}%") ? 1 : 0)
            })
            .OrderByDescending(x => x.Score)
            .Take(10)
            .ToListAsync();
    }
}