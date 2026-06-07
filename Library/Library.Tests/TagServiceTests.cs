using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class TagServiceTests
{
    private readonly Mock<ITagRepository> _repoMock;
    private readonly TagService _service;

    public TagServiceTests()
    {
        _repoMock = new Mock<ITagRepository>();
        _service = new TagService(_repoMock.Object);
    }

    // =========================
    // ADD
    // =========================

    [Fact]
    public async Task AddAsync_ShouldThrow_WhenTagAlreadyExists()
    {
        var tag = new Tag(0, "Fantasy");

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Fantasy"))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.AddAsync(tag));
    }

    [Fact]
    public async Task AddAsync_ShouldCreateTag()
    {
        var tag = new Tag(0, "Fantasy");

        _repoMock
            .Setup(r => r.ExistsByNameAsync("Fantasy"))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.AddAsync(tag))
            .ReturnsAsync(new Tag(1, "Fantasy"));

        var result = await _service.AddAsync(tag);

        Assert.Equal("Fantasy", result.Name);

        _repoMock.Verify(
            r => r.AddAsync(tag),
            Times.Once);
    }

    // =========================
    // GET
    // =========================

    [Fact]
    public async Task GetById_ShouldReturnTag()
    {
        var tag = new Tag(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(tag);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Fantasy", result!.Name);
    }

    [Fact]
    public async Task GetAll_ShouldReturnTags()
    {
        var tags = new List<Tag>
        {
            new(1, "Fantasy"),
            new(2, "Adventure")
        };

        _repoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(tags);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    // =========================
    // UPDATE
    // =========================

    [Fact]
    public async Task Update_ShouldThrow_WhenTagNotFound()
    {
        var tag = new Tag(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Tag?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAsync(tag));
    }

    [Fact]
    public async Task Update_ShouldCallRepository_WhenTagExists()
    {
        var tag = new Tag(1, "Fantasy");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(tag);

        await _service.UpdateAsync(tag);

        _repoMock.Verify(
            r => r.UpdateAsync(tag),
            Times.Once);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task Delete_ShouldThrow_WhenTagNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Tag?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.DeleteAsync(1));
    }

    [Fact]
    public async Task Delete_ShouldCallRepository_WhenTagExists()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Tag(1, "Fantasy"));

        await _service.DeleteAsync(1);

        _repoMock.Verify(
            r => r.DeleteAsync(1),
            Times.Once);
    }

    // =========================
    // PAGING
    // =========================

    [Fact]
    public async Task GetPaged_ShouldReturnData()
    {
        var data = (
            Items: new List<Tag>
            {
                new(1, "Fantasy")
            },
            TotalCount: 1
        );

        _repoMock
            .Setup(r => r.GetPagedAsync("Fan", 1, 10))
            .ReturnsAsync(data);

        var result = await _service.GetPaged("Fan", 1, 10);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
    }
}