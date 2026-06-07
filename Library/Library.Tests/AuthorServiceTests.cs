using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class AuthorServiceTests
{
    private readonly Mock<IAuthorRepository> _repoMock;
    private readonly AuthorService _service;

    public AuthorServiceTests()
    {
        _repoMock = new Mock<IAuthorRepository>();
        _service = new AuthorService(_repoMock.Object);
    }

    // =========================
    // ADD
    // =========================

    [Fact]
    public async Task AddAsync_ShouldThrow_WhenNameIsEmpty()
    {
        var author = new Author(0, "", null, null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.AddAsync(author));
    }

    [Fact]
    public async Task AddAsync_ShouldThrow_WhenAuthorAlreadyExists()
    {
        var author = new Author(0, "Tolkien", null, null);

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Tolkien"))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.AddAsync(author));
    }

    [Fact]
    public async Task AddAsync_ShouldCreateAuthor()
    {
        var author = new Author(0, "Tolkien", null, null);

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Tolkien"))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.AddAsync(author))
            .ReturnsAsync(new Author(1, "Tolkien", null, null));

        var result = await _service.AddAsync(author);

        _repoMock.Verify(r => r.AddAsync(author), Times.Once);

        Assert.Equal("Tolkien", result.Name);
    }

    // =========================
    // GET
    // =========================

    [Fact]
    public async Task GetById_ShouldReturnAuthor()
    {
        var author = new Author(1, "Rowling", null, null);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(author);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Rowling", result!.Name);
    }

    [Fact]
    public async Task GetAll_ShouldReturnList()
    {
        var list = new List<Author>
        {
            new Author(1, "A", null, null),
            new Author(2, "B", null, null)
        };

        _repoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(list);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task Delete_ShouldThrow_WhenAuthorNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Author?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.DeleteAsync(1));
    }

    [Fact]
    public async Task Delete_ShouldCallRepository_WhenAuthorExists()
    {
        var author = new Author(1, "Test", null, null);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(author);

        await _service.DeleteAsync(1);

        _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    // =========================
    // UPDATE
    // =========================

    [Fact]
    public async Task Update_ShouldThrow_WhenAuthorNotFound()
    {
        var author = new Author(1, "New Name", null, null);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Author?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAsync(author));
    }

    [Fact]
    public async Task Update_ShouldCallRepository_WhenValid()
    {
        var author = new Author(1, "Old Name", null, null);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(author);

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Old Name"))
            .ReturnsAsync(false);

        await _service.UpdateAsync(author);

        _repoMock.Verify(r => r.UpdateAsync(author), Times.Once);
    }

    // =========================
    // PAGING
    // =========================

    [Fact]
    public async Task GetPaged_ShouldReturnData()
    {
        var data = (
            Items: new List<Author>
            {
                new Author(1, "A", null, null)
            },
            TotalCount: 1
        );

        _repoMock
            .Setup(r => r.GetPagedAsync("A", 1, 10))
            .ReturnsAsync(data);

        var result = await _service.GetPaged("A", 1, 10);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
    }
}