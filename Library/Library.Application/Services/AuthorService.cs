using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        public async Task<Author?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task AddAsync(Author author)
        {
            var exists = await _repo.ExistsByNameAsync(author.Name);

            if (exists)
                throw new Exception("Author already exists");

            await _repo.AddAsync(author);
        }

        public async Task UpdateAsync(Author author)
        {
            await _repo.UpdateAsync(author);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
    }
}
