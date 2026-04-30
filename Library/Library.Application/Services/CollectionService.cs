using Library.Domain.Interfaces;
using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Application.Services
{
    public class CollectionService
    {
        private readonly ICollectionRepository _repo;

        public CollectionService(ICollectionRepository repo)
        {
            _repo = repo;
        }

        public Task<List<Collection>> GetUserCollections(int userId)
            => _repo.GetByUserIdAsync(userId);

        public Task<Collection?> Get(int id)
            => _repo.GetByIdAsync(id);

        public Task Create(string title, int userId)
            => _repo.AddAsync(new Collection(0, title, userId));

        public async Task AddBook(int collectionId, int bookId, int userId)
        {
            var collection = await _repo.GetByIdAsync(collectionId);

            if (collection == null)
                throw new Exception("Collection not found");

            if (collection.UserId != userId)
                throw new UnauthorizedAccessException();

            await _repo.AddBookAsync(collectionId, bookId);
        }

        public async Task RemoveBook(int collectionId, int bookId, int userId)
        {
            var collection = await _repo.GetByIdAsync(collectionId);

            if (collection == null)
                throw new Exception("Collection not found");

            if (collection.UserId != userId)
                throw new UnauthorizedAccessException();

            await _repo.RemoveBookAsync(collectionId, bookId);
        }

        public async Task Delete(int id, int userId)
        {
            var collection = await _repo.GetByIdAsync(id);

            if (collection == null)
                throw new Exception("Collection not found");

            if (collection.UserId != userId)
                throw new UnauthorizedAccessException();

            await _repo.DeleteAsync(id);
        }
    }
}
