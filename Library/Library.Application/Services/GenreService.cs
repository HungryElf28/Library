using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using Library.Domain.Interfaces; 

namespace Library.Application.Services
{
    public class GenreService
    {
        private readonly IGenreRepository _repo;

        public GenreService(IGenreRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Genre>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Genre?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task AddAsync(Genre genre)
        {
            var exists = await _repo.ExistsByNameAsync(genre.Name);

            if (exists)
                throw new Exception("Genre already exists");
            await _repo.AddAsync(genre);
        }

        public async Task UpdateAsync(Genre genre)
        {
            await _repo.UpdateAsync(genre);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
    }
}
