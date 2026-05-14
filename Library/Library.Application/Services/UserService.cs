using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services
{
    public class UserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task AddToFavorites(int userId, int bookId)
        {
            await _repo.AddToFavoritesAsync(userId, bookId);
        }

        public async Task RemoveFromFavorites(int userId, int bookId)
        {
            await _repo.RemoveFromFavoritesAsync(userId, bookId);
        }

        public async Task<List<Book>> GetFavorites(int userId)
        {
            return await _repo.GetFavoritesAsync(userId);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<List<ReadingBook>> GetReading(int userId)
        {
            return await _repo.GetReadingAsync(userId);
        }

        public async Task SaveProgress(int userId, int bookId, int page, int totalPages)
        {
            await _repo.SaveProgressAsync(userId, bookId, page, totalPages);
        }

        public async Task<ReadingBook?> GetProgress(int userId, int bookId)
        {
            return await _repo.GetProgressAsync(userId, bookId);
        }

        public async Task UpdateSubscription(int userId, bool isSubscribed, DateTime? expiresAt)
        {
            await _repo.UpdateSubscriptionAsync(userId, isSubscribed, expiresAt);
        }

        public async Task UpdateAvatar(int userId, string? avatarFile)
        {
            await _repo.UpdateAvatarAsync(userId, avatarFile);
        }

        public async Task DeleteUser(int userId)
        {
            await _repo.DeleteAsync(userId);
        }

        public async Task ChangeRole(int userId, string roleName)
        {
            await _repo.ChangeRoleAsync(userId, roleName);
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _repo.GetAllAsync();
        }
    }
}
