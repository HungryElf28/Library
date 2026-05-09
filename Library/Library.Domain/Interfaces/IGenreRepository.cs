using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IGenreRepository
    {
        Task<List<Genre>> GetAllAsync();
        Task<(List<Genre> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize);
        Task<Genre?> GetByIdAsync(int id);
        Task<Genre> AddAsync(Genre genre);
        Task<bool> ExistsByNameAsync(string name);
        Task UpdateAsync(Genre newGenre);
        Task DeleteAsync(int id);
        Task<List<SearchProjection>> SearchAsync(string query);
    }
}
