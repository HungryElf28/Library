using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Interfaces
{
    public interface IBookmarkRepository
    {
        Task<List<Bookmark>> GetByBookIdAsync(int userId, int bookId);
        Task<Bookmark> AddAsync(Bookmark bookmark);
        Task UpdateAsync(Bookmark bookmark);
        Task DeleteAsync(int id);
    }
}
