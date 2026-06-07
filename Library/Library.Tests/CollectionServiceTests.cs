using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class CollectionServiceTests
{
    private readonly Mock<ICollectionRepository> _repoMock;
    private readonly CollectionService _service;

    public CollectionServiceTests()
    {
        _repoMock = new Mock<ICollectionRepository>();
        _service = new CollectionService(_repoMock.Object);
    }

    // =========================
    // GET
    // =========================

    [Fact]
    public async Task GetUserCollections_ShouldReturnList()
    {
        var collections = new List<Collection>
        {
            new Collection(1, "A", 1),
            new Collection(2, "B", 1)
        };

        _repoMock
            .Setup(r => r.GetByUserIdAsync(1))
            .ReturnsAsync(collections);

        var result = await _service.GetUserCollections(1);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Get_ShouldReturnCollection()
    {
        var collection = new Collection(1, "Test", 1);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        var result = await _service.Get(1);

        Assert.NotNull(result);
        Assert.Equal("Test", result!.Title);
    }

    // =========================
    // CREATE
    // =========================

    [Fact]
    public async Task Create_ShouldCallRepo()
    {
        _repoMock
            .Setup(r => r.AddAsync(It.IsAny<Collection>()))
            .Returns(Task.CompletedTask);

        await _service.Create("My Collection", 1);

        _repoMock.Verify(r =>
            r.AddAsync(It.Is<Collection>(
                c => c.Title == "My Collection" && c.UserId == 1
            )),
            Times.Once);
    }

    // =========================
    // UPDATE
    // =========================

    [Fact]
    public async Task Update_ShouldThrow_WhenNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.Update(1, "New Title", 1));
    }

    [Fact]
    public async Task Update_ShouldThrow_WhenUserNotOwner()
    {
        var collection = new Collection(1, "Test", 999);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.Update(1, "New Title", 1));
    }

    [Fact]
    public async Task Update_ShouldCallRepo_WhenValid()
    {
        var collection = new Collection(1, "Old", 1);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<Collection>()))
            .Returns(Task.CompletedTask);

        await _service.Update(1, "New", 1);

        _repoMock.Verify(r =>
            r.UpdateAsync(It.Is<Collection>(
                c => c.Id == 1 &&
                     c.Title == "New" &&
                     c.UserId == 1
            )),
            Times.Once);
    }

    // =========================
    // ADD BOOK
    // =========================

    [Fact]
    public async Task AddBook_ShouldThrow_WhenNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.AddBook(1, 10, 1));
    }

    [Fact]
    public async Task AddBook_ShouldThrow_WhenNotOwner()
    {
        var collection = new Collection(1, "Test", 999);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.AddBook(1, 10, 1));
    }

    [Fact]
    public async Task AddBook_ShouldCallRepo_WhenValid()
    {
        var collection = new Collection(1, "Test", 1);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        _repoMock
            .Setup(r => r.AddBookAsync(1, 10))
            .Returns(Task.CompletedTask);

        await _service.AddBook(1, 10, 1);

        _repoMock.Verify(r => r.AddBookAsync(1, 10), Times.Once);
    }

    // =========================
    // REMOVE BOOK
    // =========================

    [Fact]
    public async Task RemoveBook_ShouldCallRepo_WhenValid()
    {
        var collection = new Collection(1, "Test", 1);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        _repoMock
            .Setup(r => r.RemoveBookAsync(1, 10))
            .Returns(Task.CompletedTask);

        await _service.RemoveBook(1, 10, 1);

        _repoMock.Verify(r => r.RemoveBookAsync(1, 10), Times.Once);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task Delete_ShouldThrow_WhenNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Collection?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.Delete(1, 1));
    }

    [Fact]
    public async Task Delete_ShouldThrow_WhenNotOwner()
    {
        var collection = new Collection(1, "Test", 999);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.Delete(1, 1));
    }

    [Fact]
    public async Task Delete_ShouldCallRepo_WhenValid()
    {
        var collection = new Collection(1, "Test", 1);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(collection);

        _repoMock
            .Setup(r => r.DeleteAsync(1))
            .Returns(Task.CompletedTask);

        await _service.Delete(1, 1);

        _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }
}