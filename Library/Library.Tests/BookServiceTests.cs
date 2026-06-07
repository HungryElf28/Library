using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class BookServiceTests
{
    private readonly Mock<IBookRepository> _bookRepoMock;
    private readonly BookService _service;

    public BookServiceTests()
    {
        _bookRepoMock = new Mock<IBookRepository>();
        _service = new BookService(_bookRepoMock.Object);
    }

    // =========================
    // HELPERS
    // =========================

    private Book CreateBook(int id = 1)
    {
        var book = new Book(
            id,
            "Title",
            "TextFile.txt",
            null,
            "Description",
            16,
            4.5,
            20,
            16
        );

        book.Authors.Add(new Author(1, "Tolkien", null, null));
        book.Genres.Add(new Genre(1, "Fantasy"));
        book.Tags.Add(new Tag(1, "Magic"));

        return book;
    }

    // =========================
    // GET ALL
    // =========================

    [Fact]
    public async Task GetAllAsync_ShouldReturnBooks()
    {
        var books = new List<Book>
        {
            CreateBook(1),
            CreateBook(2)
        };

        _bookRepoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(books);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    // =========================
    // GET BY ID
    // =========================

    [Fact]
    public async Task GetByIdAsync_ShouldReturnBook()
    {
        var book = CreateBook(1);

        _bookRepoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(book);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Title", result!.Title);
    }

    // =========================
    // ADD
    // =========================

    [Fact]
    public async Task AddAsync_ShouldCallRepo()
    {
        var book = CreateBook(1);

        _bookRepoMock
            .Setup(r => r.AddAsync(book))
            .ReturnsAsync(book);

        var result = await _service.AddAsync(book);

        _bookRepoMock.Verify(r => r.AddAsync(book), Times.Once);
        Assert.Equal("Title", result.Title);
    }

    // =========================
    // UPDATE
    // =========================

    [Fact]
    public async Task UpdateAsync_ShouldCallRepo()
    {
        var book = CreateBook(1);

        _bookRepoMock
            .Setup(r => r.UpdateAsync(book))
            .Returns(Task.CompletedTask);

        await _service.UpdateAsync(book);

        _bookRepoMock.Verify(r => r.UpdateAsync(book), Times.Once);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task DeleteAsync_ShouldCallRepo()
    {
        _bookRepoMock
            .Setup(r => r.DeleteAsync(1))
            .Returns(Task.CompletedTask);

        await _service.DeleteAsync(1);

        _bookRepoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    // =========================
    // PAGED
    // =========================

    [Fact]
    public async Task GetPaged_ShouldReturnData()
    {
        var books = new List<Book> { CreateBook(1) };

        _bookRepoMock
            .Setup(r => r.GetPagedAsync(
                "test",
                1,
                1,
                1,
                1,
                10,
                It.IsAny<BookSortBy>(),
                It.IsAny<BookSortOrder>()))
            .ReturnsAsync((books, 1));

        var result = await _service.GetPaged(
            "test", 1, 1, 1,
            1, 10,
            BookSortBy.Title,
            BookSortOrder.Asc);

        Assert.Single(result.Item1);
        Assert.Equal(1, result.Item2);
    }

    // =========================
    // RECOMMENDATIONS (simple case)
    // =========================

    [Fact]
    public async Task GetRecommendations_ShouldReturnFallback_WhenEmpty()
    {
        var userRepoMock = new Mock<IUserRepository>();

        userRepoMock
            .Setup(r => r.GetFavoritesAsync(1))
            .ReturnsAsync(new List<Book>());

        userRepoMock
            .Setup(r => r.GetReadingAsync(1))
            .ReturnsAsync(new List<ReadingBook>());

        _bookRepoMock
            .Setup(r => r.GetRecommendationsAsync(
                1,
                It.IsAny<List<int>>(),
                It.IsAny<List<int>>(),
                It.IsAny<List<int>>(),
                It.IsAny<List<int>>()))
            .ReturnsAsync(new List<Book>());

        _bookRepoMock
            .Setup(r => r.GetMostReadBooksAsync(15, null, null))
            .ReturnsAsync(new List<Book> { CreateBook(99) });

        var result = await _service.GetRecommendationsAsync(1, userRepoMock.Object);

        Assert.Single(result);
    }
}