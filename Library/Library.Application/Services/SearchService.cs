using Library.Domain.Interfaces;
using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Application.Services
{
    public class SearchService
    {
        private readonly IBookRepository _bookRepo;
        private readonly IAuthorRepository _authorRepo;
        private readonly IGenreRepository _genreRepo;

        public SearchService(
            IBookRepository bookRepo,
            IAuthorRepository authorRepo,
            IGenreRepository genreRepo)
        {
            _bookRepo = bookRepo;
            _authorRepo = authorRepo;
            _genreRepo = genreRepo;
        }

        public async Task<List<SearchProjection>> GlobalSearchAsync(string query)
        {
            var books = await _bookRepo.SearchAsync(query);
            var authors = await _authorRepo.SearchAsync(query);
            var genres = await _genreRepo.SearchAsync(query);

            return books
                .Concat(authors)
                .Concat(genres)
                .OrderByDescending(x => x.Score)
                .ToList();
        }
    }
}
