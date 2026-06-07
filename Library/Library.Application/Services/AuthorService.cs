using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services
{
    public class AuthorService
    {
        private readonly IAuthorRepository _repo;

        public AuthorService(IAuthorRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Author>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<(List<Author> Items, int TotalCount)> GetPaged(string? searchTerm, int page, int pageSize)
        {
            return await _repo.GetPagedAsync(searchTerm, page, pageSize);
        }

        public async Task<Author?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<Author> AddAsync(Author author)
        {
            if (string.IsNullOrWhiteSpace(author.Name))
                throw new Exception("Author name is required");

            var exists = await _repo.ExistsByNameAsync(author.Name);

            if (exists)
                throw new Exception("Author already exists");

            return await _repo.AddAsync(author);
        }

        public async Task UpdateAsync(Author author)
        {
            var existing = await _repo.GetByIdAsync(author.Id);

            if (existing == null)
                throw new Exception("Author not found");

            await _repo.UpdateAsync(author);
        }

        public async Task DeleteAsync(int id)
        {
            var author = await _repo.GetByIdAsync(id);

            if (author == null)
                throw new Exception("Author not found");

            await _repo.DeleteAsync(id);
        }
    }
}
