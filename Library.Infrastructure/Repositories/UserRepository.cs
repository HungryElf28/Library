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
}