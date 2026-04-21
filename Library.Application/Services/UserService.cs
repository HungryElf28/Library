using Library.Domain.Interfaces;
using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    }
}
