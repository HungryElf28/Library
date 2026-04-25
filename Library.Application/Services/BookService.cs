using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Application.Common.Enums;

namespace Library.Application.Services
{
    public class BookService
    {
        private readonly IBookRepository _repo;

        public BookService(IBookRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Book>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task AddAsync(Book book)
        {
            await _repo.AddAsync(book);
        }

        public async Task UpdateAsync(Book book)
        {
            await _repo.UpdateAsync(book);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
        public async Task<(List<Book>, int)> GetPaged(int? genreId, int? authorId, int page, int pageSize, BookSortBy sortBy, BookSortOrder sortOrder)
        {
            return await _repo.GetPagedAsync(genreId, authorId, page, pageSize, sortBy, sortOrder);
        }

    }
}
