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

        public async Task<Dictionary<string, List<string>>> GetCategorizedSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return new Dictionary<string, List<string>>();

            var books = await _bookRepo.SearchAsync(query);
            var authors = await _authorRepo.SearchAsync(query);
            var genres = await _genreRepo.SearchAsync(query);
            var tags = await _tagRepo.SearchAsync(query);

            var result = new Dictionary<string, List<string>>();

            var bookTitles = books
                .Where(x => x.TitleSimilarity > 0.2)
                .OrderByDescending(x => x.TitleSimilarity)
                .Select(x => x.Title)
                .Distinct()
                .Take(5)
                .ToList();
            if (bookTitles.Any()) result["Книги"] = bookTitles;

            var authorNames = authors
                .Where(x => x.TitleSimilarity > 0.2)
                .OrderByDescending(x => x.TitleSimilarity)
                .Select(x => x.Title)
                .Distinct()
                .Take(5)
                .ToList();
            if (authorNames.Any()) result["Авторы"] = authorNames;

            var genreNames = genres
                .Where(x => x.TitleSimilarity > 0.2)
                .OrderByDescending(x => x.TitleSimilarity)
                .Select(x => x.Title)
                .Distinct()
                .Take(5)
                .ToList();
            if (genreNames.Any()) result["Жанры"] = genreNames;

            var tagNames = tags
                .Where(x => x.TitleSimilarity > 0.2)
                .OrderByDescending(x => x.TitleSimilarity)
                .Select(x => x.Title)
                .Distinct()
                .Take(5)
                .ToList();
            if (tagNames.Any()) result["Теги"] = tagNames;

            return result;
        }

        public async Task<List<string>> GetSearchSuggestionsAsync(string query)
        {
            var categorized = await GetCategorizedSuggestionsAsync(query);
            return categorized.Values.SelectMany(x => x).Distinct().Take(8).ToList();
        }
    }
}
