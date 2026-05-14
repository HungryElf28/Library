using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;
using Microsoft.EntityFrameworkCore;
namespace Library.Infrastructure.Repositories;

public class GenreRepository : IGenreRepository
{
    private readonly LibraryDbContext _context;

    public GenreRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<List<Genre>> GetAllAsync()
    {
        var efGenres = await _context.Genres
            .Include(b => b.Books)
            .ToListAsync();

        return efGenres.Select(GenreMapper.ToDomain).ToList();
    }

    public async Task<(List<Genre> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize)
    {
        var query = _context.Genres.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(g => g.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items.Select(GenreMapper.ToDomain).ToList(), total);
    }

    public async Task<Genre?> GetByIdAsync(int id)
    {
        var efGenres = await _context.Genres
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efGenres == null ? null : GenreMapper.ToDomain(efGenres);
    }

    public async Task<Genre> AddAsync(Genre genre)
    {
        var efGenre = GenreMapper.ToEf(genre);

        _context.Genres.Add(efGenre);
        await _context.SaveChangesAsync();

        return GenreMapper.ToDomain(efGenre);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Genres
            .AnyAsync(g => g.Name.ToLower() == name.ToLower());
    }

    public async Task UpdateAsync(Genre newGenre)
    {
        var oldGenre = await _context.Genres
            .FirstOrDefaultAsync(a => a.Id == newGenre.Id);

        if (oldGenre == null)
            throw new Exception("Genre not found");

        oldGenre.Name = newGenre.Name;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var genre = await _context.Genres
            .FirstOrDefaultAsync(b => b.Id == id);

        if (genre == null)
            throw new Exception("Genre not found");

        _context.Genres.Remove(genre);

        await _context.SaveChangesAsync();
    }

    public async Task<List<SearchProjection>> SearchAsync(string query)
    {
        var genresQuery = _context.Genres.AsQueryable();

        var results = await genresQuery
            .Select(g => new
            {
                Genre = g,
                Similarity = EF.Functions.TrigramsSimilarity(g.Name, query),
                Contains = EF.Functions.ILike(g.Name, $"%{query}%")
            })
            .Where(x => x.Similarity > 0.2 || x.Contains)
            .OrderByDescending(x => (x.Contains ? 2.0 : 0) + x.Similarity)
            .Take(10)
            .ToListAsync();

        return results.Select(x => new SearchProjection
        {
            Type = "genre",
            Id = x.Genre.Id,
            Title = x.Genre.Name,
            Score = (x.Contains ? 2.0 : 0) + x.Similarity,
            TitleSimilarity = Math.Max(x.Similarity, x.Contains ? 1.0 : 0)
        })
        .ToList();
    }

}