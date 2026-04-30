using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

using EfTag = Library.Infrastructure.Data.Models.Tag;
namespace Library.Infrastructure.Repositories;

public class TagRepository : ITagRepository
{
    private readonly LibraryDbContext _context;

    public TagRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<List<Tag>> GetAllAsync()
    {
        var efTags = await _context.Tags
            .Include(b => b.Books)
            .ToListAsync();

        return efTags.Select(TagMapper.ToDomain).ToList();
    }

    public async Task<Tag?> GetByIdAsync(int id)
    {
        var efTags = await _context.Tags
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efTags == null ? null : TagMapper.ToDomain(efTags);
    }

    public async Task AddAsync(Tag tag)
    {
        var efTag = TagMapper.ToEf(tag);

        _context.Tags.Add(efTag);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Tags
            .AnyAsync(g => g.Name.ToLower() == name.ToLower());
    }

    public async Task UpdateAsync(Tag newTag)
    {
        var oldTag = await _context.Tags
            .FirstOrDefaultAsync(a => a.Id == newTag.Id);

        if (oldTag == null)
            throw new Exception("Tag not found");

        oldTag.Name = newTag.Name;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var tag = await _context.Tags
            .FirstOrDefaultAsync(b => b.Id == id);

        if (tag == null)
            throw new Exception("Tag not found");

        _context.Tags.Remove(tag);

        await _context.SaveChangesAsync();
    }
}