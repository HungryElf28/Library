using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface ITagRepository
    {
        Task<List<Tag>> GetAllAsync();
        Task<(List<Tag> Items, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize);
        Task<Tag?> GetByIdAsync(int id);
        Task<Tag> AddAsync(Tag tag);
        Task<bool> ExistsByNameAsync(string name);
        Task UpdateAsync(Tag newTag);
        Task DeleteAsync(int id);
        Task<List<SearchProjection>> SearchAsync(string query);
    }
}