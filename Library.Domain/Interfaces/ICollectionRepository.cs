using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;

namespace Library.Domain.Interfaces
{
    public interface ICollectionRepository
    {
        Task<List<Collection>> GetByUserIdAsync(int userId);

        Task<Collection?> GetByIdAsync(int id);

        Task AddAsync(Collection collection);

        Task AddBookAsync(int collectionId, int bookId);

        Task RemoveBookAsync(int collectionId, int bookId);

        Task DeleteAsync(int id);
    }
}
