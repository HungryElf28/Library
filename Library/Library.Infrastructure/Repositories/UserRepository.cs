using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Mappers;
using Microsoft.EntityFrameworkCore;

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
            BirthDate = user.BirthDate.HasValue ? DateTime.SpecifyKind(user.BirthDate.Value, DateTimeKind.Utc) : null,
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
        var normalized = login.ToUpper();
        return await _context.Users
            .AnyAsync(u => u.NormalizedLogin == normalized);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        var normalized = email.ToUpper();
        return await _context.Users
            .AnyAsync(u => u.NormalizedEmail == normalized);
    }

    public async Task<User?> GetByLoginAsync(string login)
    {
        var efUser = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Login == login);

        return efUser == null ? null : UserMapper.ToDomain(efUser);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        var efUser = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        return efUser == null ? null : UserMapper.ToDomain(efUser);
    }

    public async Task<(User user, string passwordHash)?> GetWithPasswordAsync(string login)
    {
        var ef = await _context.Users
            .Include(u => u.Role)
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
            .Include(u => u.Books)
                .ThenInclude(b => b.Genres)
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

    public async Task SaveProgressAsync(int userId, int bookId, int page, int? charOffset, int totalPages)
    {
        var now = DateTime.UtcNow;

        var entity = await _context.ReadingBooks
            .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);

        if (entity == null)
        {
            entity = new Data.Models.ReadingBook
            {
                UserId = userId,
                BookId = bookId,
                Page = page,
                CharOffset = charOffset,
                TotalPages = totalPages,
                LastOpened = now
            };

            _context.ReadingBooks.Add(entity);

            var book = await _context.Books.FindAsync(bookId);
            if (book != null)
            {
                book.ReadCount++;
            }
        }
        else
        {
            entity.Page = page;
            entity.CharOffset = charOffset;
            if (totalPages > 0)
            {
                entity.TotalPages = totalPages;
            }
            entity.LastOpened = now;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<ReadingBook?> GetProgressAsync(int userId, int bookId)
    {
        var r = await _context.ReadingBooks
            .Include(r => r.Book)
            .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);

        if (r == null) return null;

        return new ReadingBook(
            r.BookId,
            r.Book.Title,
            r.Book.CoverFile,
            r.Page,
            r.CharOffset,
            r.TotalPages,
            r.LastOpened
        );
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
                r.CharOffset,
                r.TotalPages,
                r.LastOpened
            ))
            .ToListAsync();
    }

    public async Task UpdateSubscriptionAsync(int userId, bool isSubscribed, DateTime? expiresAt)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        user.IsSubscribed = isSubscribed;
        user.SubscriptionExpiresAt = expiresAt.HasValue ? DateTime.SpecifyKind(expiresAt.Value, DateTimeKind.Utc) : null;

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAvatarAsync(int userId, string? avatarFile)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        user.AvatarFile = avatarFile;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ChangeRoleAsync(int userId, string roleName)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        var roleId = await GetRoleIdByNameAsync(roleName);
        user.RoleId = roleId;

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAccountAsync(int userId, string login, string email, string? passwordHash, DateTime? birthDate)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        user.Login = login;
        user.NormalizedLogin = login.ToUpper();
        user.Email = email;
        user.NormalizedEmail = email.ToUpper();
        
        if (birthDate.HasValue)
        {
            user.BirthDate = DateTime.SpecifyKind(birthDate.Value, DateTimeKind.Utc);
        }
        else
        {
            user.BirthDate = null;
        }
        
        if (passwordHash != null)
        {
            user.PasswordHash = passwordHash;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<Data.Models.User?> GetEfByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<List<User>> GetAllAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .ToListAsync();

        return users.Select(UserMapper.ToDomain).ToList();
    }
}
