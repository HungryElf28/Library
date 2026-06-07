using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class SearchServiceTests
{
    private readonly Mock<IBookRepository> _bookRepo;
    private readonly Mock<IAuthorRepository> _authorRepo;
    private readonly Mock<IGenreRepository> _genreRepo;
    private readonly Mock<ITagRepository> _tagRepo;

    private readonly SearchService _service;

    public SearchServiceTests()
    {
        _bookRepo = new Mock<IBookRepository>();
        _authorRepo = new Mock<IAuthorRepository>();
        _genreRepo = new Mock<IGenreRepository>();
        _tagRepo = new Mock<ITagRepository>();

        _service = new SearchService(
            _bookRepo.Object,
            _authorRepo.Object,
            _genreRepo.Object,
            _tagRepo.Object);
    }

    [Fact]
    public async Task GlobalSearch_ShouldReturnAllResults()
    {
        _bookRepo
            .Setup(x => x.SearchAsync("tolkien"))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Hobbit",
                Score = 0.8
            }
            });

        _authorRepo
            .Setup(x => x.SearchAsync("tolkien"))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Tolkien",
                Score = 0.9
            }
            });

        _genreRepo
            .Setup(x => x.SearchAsync("tolkien"))
            .ReturnsAsync(new List<SearchProjection>());

        _tagRepo
            .Setup(x => x.SearchAsync("tolkien"))
            .ReturnsAsync(new List<SearchProjection>());

        var result = await _service.GlobalSearchAsync("tolkien");

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GlobalSearch_ShouldSortByScoreDescending()
    {
        _bookRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Book",
                Score = 0.5
            }
            });

        _authorRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Author",
                Score = 0.9
            }
            });

        _genreRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        _tagRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        var result = await _service.GlobalSearchAsync("test");

        Assert.Equal("Author", result.First().Title);
    }

    [Fact]
    public async Task GetCategorizedSuggestions_ShouldReturnEmpty_WhenQueryEmpty()
    {
        var result =
            await _service.GetCategorizedSuggestionsAsync("");

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetCategorizedSuggestions_ShouldCreateBookCategory()
    {
        _bookRepo
            .Setup(x => x.SearchAsync("hob"))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Hobbit",
                TitleSimilarity = 0.8
            }
            });

        _authorRepo
            .Setup(x => x.SearchAsync("hob"))
            .ReturnsAsync(new List<SearchProjection>());

        _genreRepo
            .Setup(x => x.SearchAsync("hob"))
            .ReturnsAsync(new List<SearchProjection>());

        _tagRepo
            .Setup(x => x.SearchAsync("hob"))
            .ReturnsAsync(new List<SearchProjection>());

        var result =
            await _service.GetCategorizedSuggestionsAsync("hob");

        Assert.True(result.ContainsKey("Книги"));
    }

    [Fact]
    public async Task GetCategorizedSuggestions_ShouldIgnoreLowSimilarity()
    {
        _bookRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Hobbit",
                TitleSimilarity = 0.1
            }
            });

        _authorRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        _genreRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        _tagRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        var result =
            await _service.GetCategorizedSuggestionsAsync("hob");

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetSearchSuggestions_ShouldReturnDistinctValues()
    {
        _bookRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Hobbit",
                TitleSimilarity = 0.9
            }
            });

        _authorRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>
            {
            new SearchProjection
            {
                Title = "Tolkien",
                TitleSimilarity = 0.9
            }
            });

        _genreRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        _tagRepo
            .Setup(x => x.SearchAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<SearchProjection>());

        var result =
            await _service.GetSearchSuggestionsAsync("tol");

        Assert.Contains("Hobbit", result);
        Assert.Contains("Tolkien", result);
    }
}