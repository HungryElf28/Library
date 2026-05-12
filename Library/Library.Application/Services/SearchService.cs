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
        private readonly ITagRepository _tagRepo;

        public SearchService(
            IBookRepository bookRepo,
            IAuthorRepository authorRepo,
            IGenreRepository genreRepo,
            ITagRepository tagRepo)
        {
            _bookRepo = bookRepo;
            _authorRepo = authorRepo;
            _genreRepo = genreRepo;
            _tagRepo = tagRepo;
        }

        public async Task<List<SearchProjection>> GlobalSearchAsync(string query)
        {
            var books = await _bookRepo.SearchAsync(query);
            var authors = await _authorRepo.SearchAsync(query);
            var genres = await _genreRepo.SearchAsync(query);
            var tags = await _tagRepo.SearchAsync(query);

            return books
                .Concat(authors)
                .Concat(genres)
                .Concat(tags)
                .OrderByDescending(x => x.Score)
                .ToList();
        }

        public async Task<List<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 3) return new List<string>();

            var books = await _bookRepo.SearchAsync(query);
            var authors = await _authorRepo.SearchAsync(query);
            
            if (books.Any(x => x.Score >= 1.0) || authors.Any(x => x.Score >= 1.0)) 
                return new List<string>();

            var suggestions = books.Concat(authors)
                .OrderByDescending(x => x.Score)
                .Take(3)
                .Select(x => x.Title)
                .Distinct()
                .ToList();

            return suggestions;
        }
    }
}
