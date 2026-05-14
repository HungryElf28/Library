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

    public async Task<(List<Tag> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize)
    {
        var query = _context.Tags.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items.Select(TagMapper.ToDomain).ToList(), total);
    }

    public async Task<Tag?> GetByIdAsync(int id)
    {
        var efTags = await _context.Tags
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);

        return efTags == null ? null : TagMapper.ToDomain(efTags);
    }

    public async Task<Tag> AddAsync(Tag tag)
    {
        var efTag = TagMapper.ToEf(tag);

        _context.Tags.Add(efTag);
        await _context.SaveChangesAsync();

        return TagMapper.ToDomain(efTag);
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

    public async Task<List<SearchProjection>> SearchAsync(string query)
    {
        var tagsQuery = _context.Tags.AsQueryable();

        var results = await tagsQuery
            .Select(t => new
            {
                Tag = t,
                Similarity = EF.Functions.TrigramsSimilarity(t.Name, query),
                Contains = EF.Functions.ILike(t.Name, $"%{query}%")
            })
            .Where(x => x.Similarity > 0.2 || x.Contains)
            .OrderByDescending(x => (x.Contains ? 2.0 : 0) + x.Similarity)
            .Take(10)
            .ToListAsync();

        return results.Select(x => new SearchProjection
        {
            Type = "tag",
            Id = x.Tag.Id,
            Title = x.Tag.Name,
            Score = (x.Contains ? 2.0 : 0) + x.Similarity,
            TitleSimilarity = Math.Max(x.Similarity, x.Contains ? 1.0 : 0)
        })
        .ToList();
    }
}