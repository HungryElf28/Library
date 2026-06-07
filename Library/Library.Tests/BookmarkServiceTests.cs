using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class BookmarkServiceTests
{
    private readonly Mock<IBookmarkRepository> _repoMock;
    private readonly BookmarkService _service;

    public BookmarkServiceTests()
    {
        _repoMock = new Mock<IBookmarkRepository>();
        _service = new BookmarkService(_repoMock.Object);
    }


    [Fact]
    public async Task GetByBookIdAsync_ShouldReturnList()
    {
        var list = new List<Bookmark>
        {
            new Bookmark(1, 1, 1, 10, null, null, null, DateTime.UtcNow),
            new Bookmark(2, 1, 1, 20, null, null, null, DateTime.UtcNow)
        };

        _repoMock
            .Setup(r => r.GetByBookIdAsync(1, 1))
            .ReturnsAsync(list);

        var result = await _service.GetByBookIdAsync(1, 1);

        Assert.Equal(2, result.Count);
    }


    [Fact]
    public async Task AddAsync_ShouldReturnCreatedBookmark()
    {
        _repoMock
            .Setup(r => r.AddAsync(It.IsAny<Bookmark>()))
            .ReturnsAsync((Bookmark b) => b);

        var result = await _service.AddAsync(
            userId: 1,
            bookId: 10,
            page: 5,
            cfi: "cfi-test",
            charOffset: 100,
            note: "test note"
        );

        _repoMock.Verify(r =>
            r.AddAsync(It.IsAny<Bookmark>()),
            Times.Once);

        Assert.Equal(1, result.UserId);
        Assert.Equal(10, result.BookId);
        Assert.Equal(5, result.Page);
        Assert.Equal("test note", result.Note);
    }

    [Fact]
    public async Task UpdateAsync_ShouldCallRepository()
    {
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<Bookmark>()))
            .Returns(Task.CompletedTask);

        await _service.UpdateAsync(1, "new note");

        _repoMock.Verify(r =>
            r.UpdateAsync(It.IsAny<Bookmark>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldCallRepository()
    {
        _repoMock
            .Setup(r => r.DeleteAsync(1))
            .Returns(Task.CompletedTask);

        await _service.DeleteAsync(1);

        _repoMock.Verify(r =>
            r.DeleteAsync(1),
            Times.Once);
    }
}