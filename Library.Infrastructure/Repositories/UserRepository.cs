using Microsoft.EntityFrameworkCore;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;

namespace Library.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly LibraryDbContext _context;

    public UserRepository(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user, string passwordHash)
    {
        var ef = new Data.Models.User
        {
            Login = user.Login,
            Email = user.Email,
            PasswordHash = passwordHash,
            NormalizedLogin = user.Login.ToUpper(),
            NormalizedEmail = user.Email.ToUpper(),
            RoleId = 1
        };

        _context.Users.Add(ef);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByLoginAsync(string login)
    {
        return await _context.Users
            .AnyAsync(u => u.Login == login);
    }

    public async Task<User?> GetByLoginAsync(string login)
    {
        var ef = await _context.Users
            .FirstOrDefaultAsync(u => u.Login == login);

        return ef == null ? null : UserMapper.ToDomain(ef);
    }

    public async Task<(User, string)?> GetWithPasswordAsync(string login)
    {
        var ef = await _context.Users
            .FirstOrDefaultAsync(u => u.Login == login);

        if (ef == null)
            return null;

        return (UserMapper.ToDomain(ef), ef.PasswordHash);
    }

    public async Task AddToFavoritesAsync(int userId, int bookId)
    {
        var user = await _context.Users
            .Include(u => u.Books)
            .FirstOrDefaultAsync(u => u.Id == userId);

        var book = await _context.Books.FindAsync(bookId);

        if (user == null || book == null)
            throw new Exception("User or Book not found");

        if (!user.Books.Any(b => b.Id == bookId))
            user.Books.Add(book);

        await _context.SaveChangesAsync();
    }

    public async Task RemoveFromFavoritesAsync(int userId, int bookId)
    {
        var user = await _context.Users
            .Include(u => u.Books)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new Exception("User not found");

        var book = user.Books.FirstOrDefault(b => b.Id == bookId);

        if (book != null)
            user.Books.Remove(book);

        await _context.SaveChangesAsync();
    }

    public async Task<List<Book>> GetFavoritesAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Books)
                .ThenInclude(b => b.Authors)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new Exception("User not found");

        return user.Books
            .Select(BookMapper.ToDomain)
            .ToList();
    }
}