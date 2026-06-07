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

        public async Task<(List<Genre> Items, int TotalCount)> GetPaged(string? searchTerm, int page, int pageSize)
        {
            return await _repo.GetPagedAsync(searchTerm, page, pageSize);
        }

        public async Task<Genre?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<Genre> AddAsync(Genre genre)
        {
            var exists = await _repo.ExistsByNameAsync(genre.Name);

            if (exists)
                throw new Exception("Genre already exists");
            return await _repo.AddAsync(genre);
        }

        public async Task UpdateAsync(Genre genre)
        {
            var exists = await _repo.GetByIdAsync(genre.Id);
            if (exists == null)
                throw new Exception("Genre not found");
            await _repo.UpdateAsync(genre);
        }

        public async Task DeleteAsync(int id)
        {
            var genre = await _repo.GetByIdAsync(id);

            if (genre == null)
                throw new Exception("Genre not found");
            await _repo.DeleteAsync(id);
        }
    }
}
