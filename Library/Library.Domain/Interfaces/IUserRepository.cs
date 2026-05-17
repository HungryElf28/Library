using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task AddAsync(User user, string passwordHash, int roleId);
        Task<bool> ExistsByLoginAsync(string login);
        Task<bool> ExistsByEmailAsync(string email);
        Task<User?> GetByLoginAsync(string login);
        Task<User?> GetByIdAsync(int id);
        Task<(User user, string passwordHash)?> GetWithPasswordAsync(string login);
        Task AddToFavoritesAsync(int userId, int bookId);
        Task RemoveFromFavoritesAsync(int userId, int bookId);
        Task<List<Book>> GetFavoritesAsync(int userId);
        Task<int> GetRoleIdByNameAsync(string roleName);
        Task<(User user, string passwordHash, string roleName)?> GetWithRoleAsync(string login);
        Task SaveProgressAsync(int userId, int bookId, int page, int? charOffset, int totalPages);
        Task<ReadingBook?> GetProgressAsync(int userId, int bookId);
        Task<List<ReadingBook>> GetReadingAsync(int userId);
        Task UpdateSubscriptionAsync(int userId, bool isSubscribed, DateTime? expiresAt);
        Task UpdateAvatarAsync(int userId, string? avatarFile);
        Task DeleteAsync(int userId);
        Task ChangeRoleAsync(int userId, string roleName);
        Task<List<User>> GetAllAsync();
        Task UpdateAccountAsync(int userId, string login, string email, string? passwordHash, DateTime? birthDate);
    }
}
