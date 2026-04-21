using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task AddAsync(User user, string passwordHash);
        Task<bool> ExistsByLoginAsync(string login);
        Task<User?> GetByLoginAsync(string login);
        Task<(User user, string passwordHash)?> GetWithPasswordAsync(string login);
        Task AddToFavoritesAsync(int userId, int bookId);
        Task RemoveFromFavoritesAsync(int userId, int bookId);
        Task<List<Book>> GetFavoritesAsync(int userId);
    }
}
