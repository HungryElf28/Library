using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class GenreServiceTests
{
    private readonly Mock<IGenreRepository> _repoMock;
    private readonly GenreService _service;

    public GenreServiceTests()
    {
        _repoMock = new Mock<IGenreRepository>();
        _service = new GenreService(_repoMock.Object);
    }

    // =========================
    // ADD
    // =========================

    [Fact]
    public async Task AddAsync_ShouldThrow_WhenGenreAlreadyExists()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Fantasy"))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.AddAsync(genre));
    }

    [Fact]
    public async Task AddAsync_ShouldCreateGenre()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Fantasy"))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.AddAsync(genre))
            .ReturnsAsync(genre);

        var result = await _service.AddAsync(genre);

        _repoMock.Verify(r => r.AddAsync(genre), Times.Once);

        Assert.Equal("Fantasy", result.Name);
    }

    // =========================
    // GET
    // =========================

    [Fact]
    public async Task GetAllAsync_ShouldReturnGenres()
    {
        var genres = new List<Genre>
        {
            new Genre(1, "Fantasy"),
            new Genre(2, "Sci-Fi")
        };

        _repoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(genres);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnGenre()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(genre);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Fantasy", result!.Name);
    }

    // =========================
    // UPDATE
    // =========================

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenGenreNotFound()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Genre?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAsync(genre));
    }

    [Fact]
    public async Task UpdateAsync_ShouldCallRepository_WhenGenreExists()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(genre);

        await _service.UpdateAsync(genre);

        _repoMock.Verify(r => r.UpdateAsync(genre), Times.Once);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenGenreNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Genre?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.DeleteAsync(1));
    }

    [Fact]
    public async Task DeleteAsync_ShouldCallRepository_WhenGenreExists()
    {
        var genre = new Genre(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(genre);

        await _service.DeleteAsync(1);

        _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    // =========================
    // PAGING
    // =========================

    [Fact]
    public async Task GetPaged_ShouldReturnData()
    {
        var data = (
            Items: new List<Genre>
            {
                new Genre(1, "Fantasy")
            },
            TotalCount: 1
        );

        _repoMock
            .Setup(r => r.GetPagedAsync("Fantasy", 1, 10))
            .ReturnsAsync(data);

        var result = await _service.GetPaged("Fantasy", 1, 10);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
    }
}