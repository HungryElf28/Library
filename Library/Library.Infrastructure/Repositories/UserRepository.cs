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

    public async Task AddAsync(User user, string passwordHash, int roleId)
    {
        var ef = new Data.Models.User
        {
            Login = user.Login,
            Email = user.Email,
            PasswordHash = passwordHash,
            NormalizedLogin = user.Login.ToUpper(),
            NormalizedEmail = user.Email.ToUpper(),
            RoleId = roleId
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

    public async Task<(User user, string passwordHash)?> GetWithPasswordAsync(string login)
    {
        var ef = await _context.Users
            .FirstOrDefaultAsync(u => u.Login == login);

        if (ef == null)
            return null;

        return (UserMapper.ToDomain(ef), ef.PasswordHash);
    }

    public async Task<(User user, string passwordHash, string roleName)?> GetWithRoleAsync(string login)
    {
        var ef = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Login == login);

        if (ef == null)
            return null;

        return (
            UserMapper.ToDomain(ef),
            ef.PasswordHash,
            ef.Role.Role1
        );
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

    public async Task<int> GetRoleIdByNameAsync(string roleName)
    {
        return await _context.Roles
            .Where(r => r.Role1 == roleName)
            .Select(r => r.Id)
            .FirstAsync();
    }

    public async Task SaveProgressAsync(int userId, int bookId, int page)
    {
        var entity = await _context.ReadingBooks
            .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (entity == null)
        {
            entity = new Data.Models.ReadingBook
            {
                UserId = userId,
                BookId = bookId,
                Page = page,
                LastOpened = today
            };

            _context.ReadingBooks.Add(entity);
        }
        else
        {
            entity.Page = page;
            entity.LastOpened = today;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int?> GetProgressAsync(int userId, int bookId)
    {
        var entity = await _context.ReadingBooks
            .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);

        return entity?.Page;
    }

    public async Task<List<ReadingBook>> GetReadingAsync(int userId)
    {
        return await _context.ReadingBooks
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.LastOpened)
            .Select(r => new ReadingBook(
                r.Book.Id,
                r.Book.Title,
                r.Book.CoverFile,
                r.Page,
                r.LastOpened
            ))
            .ToListAsync();
    }
}