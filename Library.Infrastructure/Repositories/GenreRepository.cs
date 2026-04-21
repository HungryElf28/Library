using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

using EfGenre = Library.Infrastructure.Data.Models.Genre;
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

    public async Task<Genre?> GetByIdAsync(int id)
    {
        var efGenres = await _context.Genres
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efGenres == null ? null : GenreMapper.ToDomain(efGenres);
    }

    public async Task AddAsync(Genre genre)
    {
        var efGenre = GenreMapper.ToEf(genre);

        _context.Genres.Add(efGenre);
        await _context.SaveChangesAsync();
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

    public async Task<List<Genre>> SearchAsync(string query)
    {
        var ef = await _context.Genres
            .Where(g =>
                EF.Functions.ILike(g.Name, $"%{query}%") ||
                EF.Functions.TrigramsSimilarity(g.Name, query) > 0.3
            )
            .ToListAsync();

        return ef.Select(GenreMapper.ToDomain).ToList();
    }

}