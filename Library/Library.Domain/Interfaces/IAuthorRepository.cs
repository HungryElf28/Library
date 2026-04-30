using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface IAuthorRepository
    {
        Task<List<Author>> GetAllAsync();
        Task<Author?> GetByIdAsync(int id);
        Task AddAsync(Author author);
        Task<bool> ExistsByNameAsync(string name);
        Task UpdateAsync(Author newAuthor);
        Task DeleteAsync(int id);
        Task<List<SearchProjection>> SearchAsync(string query);
    }
}