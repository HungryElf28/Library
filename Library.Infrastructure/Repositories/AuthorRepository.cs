using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

using EfAuthor = Library.Infrastructure.Data.Models.Author;
namespace Library.Infrastructure.Repositories;

public class AuthorRepository : IAuthorRepository
{
    private readonly LibraryDbContext _context;

    public AuthorRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<List<Author>> GetAllAsync()
    {
        var efAuthors = await _context.Authors
            .Include(b => b.Books)
            .ToListAsync();

        return efAuthors.Select(AuthorMapper.ToDomain).ToList();
    }

    public async Task<Author?> GetByIdAsync(int id)
    {
        var efAuthors = await _context.Authors
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efAuthors == null ? null : AuthorMapper.ToDomain(efAuthors);
    }

    public async Task AddAsync(Author author)
    {
        var efAuthor = AuthorMapper.ToEf(author);

        _context.Authors.Add(efAuthor);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Authors
            .AnyAsync(g => g.Name.ToLower() == name.ToLower());
    }

    public async Task UpdateAsync(Author newAuthor)
    {
        var oldAuthor = await _context.Authors
            .FirstOrDefaultAsync(a => a.Id == newAuthor.Id);

        if (oldAuthor == null)
            throw new Exception("Book not found");

        oldAuthor.Name = newAuthor.Name;
        oldAuthor.Bio = newAuthor.Bio;
        oldAuthor.Photo = newAuthor.Photo;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var author = await _context.Authors
            .FirstOrDefaultAsync(b => b.Id == id);

        if (author == null)
            throw new Exception("Author not found");

        _context.Authors.Remove(author);

        await _context.SaveChangesAsync();
    }

    public async Task<List<Author>> SearchAsync(string query)
    {
        var ef = await _context.Authors
            .Where(a =>
                EF.Functions.ILike(a.Name, $"%{query}%") ||
                EF.Functions.TrigramsSimilarity(a.Name, query) > 0.3
            )
            .ToListAsync();

        return ef.Select(AuthorMapper.ToDomain).ToList();
    }
}