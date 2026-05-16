using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;
using Microsoft.EntityFrameworkCore;
//using Library.Infrastructure.Data.Models;
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
            .Include(b => b.Reviews)
            .ToListAsync();

        return efBooks.Select(BookMapper.ToDomain).ToList();
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        var efBook = await _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .Include(b => b.Reviews)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efBook == null ? null : BookMapper.ToDomain(efBook);
    }

    public async Task<Book> AddAsync(Book book)
    {
        var efBook = BookMapper.ToEf(book);

        var authorIds = book.Authors.Select(x => x.Id).ToList();
        efBook.Authors = await _context.Authors
            .Where(a => authorIds.Contains(a.Id))
            .ToListAsync();

        var genreIds = book.Genres.Select(x => x.Id).ToList();
        efBook.Genres = await _context.Genres
            .Where(g => genreIds.Contains(g.Id))
            .ToListAsync();

        var tagIds = book.Tags.Select(x => x.Id).ToList();
        efBook.Tags = await _context.Tags
            .Where(t => tagIds.Contains(t.Id))
            .ToListAsync();

        _context.Books.Add(efBook);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(efBook.Id))!;
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

        if (terms.Length == 0) return new List<SearchProjection>();
        
        var patterns = terms.Select(t => $"%{t}%").ToList();

        var booksQuery = _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Reviews)
            .AsQueryable();


        var results = await booksQuery
            .Select(b => new
            {
                Book = b,
                TitleSimilarity = (double)EF.Functions.TrigramsSimilarity(b.Title, query),
                AuthorSimilarity = b.Authors.Any()
                    ? (double?)b.Authors.Max(a => EF.Functions.TrigramsSimilarity(a.Name, query)) ?? 0
                    : 0,
                MatchesTerms = patterns.All(p => 
                    EF.Functions.ILike(b.Title, p) || 
                    b.Authors.Any(a => EF.Functions.ILike(a.Name, p))
                )
            })
            .Where(x =>
                x.MatchesTerms ||
                x.TitleSimilarity > 0.1 ||
                x.AuthorSimilarity > 0.1
            )
            .OrderByDescending(x => (x.MatchesTerms ? 2.0 : 0) + (x.TitleSimilarity * 1.5) + (x.AuthorSimilarity * 1.0))
            .Take(30)
            .ToListAsync();

        return results.Select(x =>
        {
            var b = x.Book;
            return new SearchProjection
            {
                Type = "book",
                Id = b.Id,
                Title = b.Title,
                CoverFile = b.CoverFile,
                AuthorNames = b.Authors.Select(a => a.Name).ToList(),
                GenreNames = b.Genres.Select(g => g.Name).ToList(),
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => (double)r.Rate) : 0,
                Score = (x.MatchesTerms ? 2.0 : 0) + (x.TitleSimilarity * 1.5) + (x.AuthorSimilarity * 1.0),
                TitleSimilarity = Math.Max(x.TitleSimilarity, x.MatchesTerms ? 1.0 : 0)
            };
        })
        .ToList();
    }

    public async Task<(List<Book> Items, int TotalCount)> GetPagedAsync(
    string? searchTerm,
    int? genreId,
    int? authorId,
    int? tagId,
    int page,
    int pageSize,
    BookSortBy sortBy,
    BookSortOrder sortOrder)
    {
        var query = _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .Include(b => b.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(term) ||
                b.Authors.Any(a => a.Name.ToLower().Contains(term))
            );
        }

        if (genreId.HasValue)
        {
            query = query.Where(b => b.Genres.Any(g => g.Id == genreId));
        }

        if (authorId.HasValue)
        {
            query = query.Where(b => b.Authors.Any(a => a.Id == authorId));
        }

        if (tagId.HasValue)
        {
            query = query.Where(b => b.Tags.Any(t => t.Id == tagId));
        }

        query = sortBy switch
        {
            BookSortBy.Title => sortOrder == BookSortOrder.Desc
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title),

            BookSortBy.Rate => sortOrder == BookSortOrder.Desc
                ? query.OrderByDescending(b => b.Rating)
                : query.OrderBy(b => b.Rating),

            BookSortBy.ReadCount => sortOrder == BookSortOrder.Desc
                ? query.OrderByDescending(b => b.ReadCount)
                : query.OrderBy(b => b.ReadCount),

            _ => query.OrderBy(b => b.Id)
        };

        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items.Select(BookMapper.ToDomain).ToList(), total);
    }

    public async Task<List<Book>> GetRecommendationsAsync(int userId, List<int> authorIds, List<int> genreIds, List<int> tagIds, List<int> excludeBookIds)
    {
        var query = _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .Include(b => b.Reviews)
            .Where(b => !excludeBookIds.Contains(b.Id))
            .AsQueryable();

        if (!authorIds.Any() && !genreIds.Any() && !tagIds.Any())
        {
            return (await query
                .OrderByDescending(b => b.Reviews.Any() ? b.Reviews.Average(r => r.Rate) : 0)
                .Take(10)
                .ToListAsync())
                .Select(BookMapper.ToDomain)
                .ToList();
        }

        var books = await query.ToListAsync();

        var recommendations = books
            .Select(b => new
            {
                Book = b,
                Score = (b.Authors.Count(a => authorIds.Contains(a.Id)) * 3) +
                        (b.Genres.Count(g => genreIds.Contains(g.Id)) * 2) +
                        (b.Tags.Count(t => tagIds.Contains(t.Id)) * 1) +
                        (b.Reviews.Any() ? b.Reviews.Average(r => (double)r.Rate) / 2.0 : 0)
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .Take(15)
            .Select(x => BookMapper.ToDomain(x.Book))
            .ToList();

        return recommendations;
    }

    public async Task<List<Book>> GetMostReadBooksAsync(int count, int? genreId = null, int? authorId = null)
    {
        var query = _context.Books
            .Include(b => b.Authors)
            .Include(b => b.Genres)
            .Include(b => b.Tags)
            .Include(b => b.Reviews)
            .AsQueryable();

        if (genreId.HasValue)
        {
            query = query.Where(b => b.Genres.Any(g => g.Id == genreId));
        }

        if (authorId.HasValue)
        {
            query = query.Where(b => b.Authors.Any(a => a.Id == authorId));
        }

        var books = await query
            .OrderByDescending(b => b.ReadCount)
            .Take(count)
            .ToListAsync();

        return books.Select(BookMapper.ToDomain).ToList();
    }
}
