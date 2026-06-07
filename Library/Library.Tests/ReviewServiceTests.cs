using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class ReviewServiceTests
{
    private readonly Mock<IReviewRepository> _repoMock;
    private readonly ReviewService _service;

    public ReviewServiceTests()
    {
        _repoMock = new Mock<IReviewRepository>();
        _service = new ReviewService(_repoMock.Object);
    }

    // =========================
    // ADD OR UPDATE
    // =========================

    [Fact]
    public async Task AddOrUpdate_ShouldCallRepository()
    {
        _repoMock
            .Setup(r => r.AddOrUpdateAsync(It.IsAny<Review>()))
            .Returns(Task.CompletedTask);

        await _service.AddOrUpdate(
            1,
            10,
            5,
            "Excellent book");

        _repoMock.Verify(r =>
            r.AddOrUpdateAsync(
                It.Is<Review>(x =>
                    x.UserId == 1 &&
                    x.BookId == 10 &&
                    x.Rate == 5 &&
                    x.Text == "Excellent book")),
            Times.Once);
    }

    // =========================
    // GET BY BOOK
    // =========================

    [Fact]
    public async Task GetByBook_ShouldReturnReviews()
    {
        var reviews = new List<Review>
        {
            new Review(1, 1, 10, 5, "Great"),
            new Review(2, 2, 10, 4, "Good")
        };

        _repoMock
            .Setup(r => r.GetByBookIdAsync(10))
            .ReturnsAsync(reviews);

        var result = await _service.GetByBook(10);

        Assert.Equal(2, result.Count);
    }

    // =========================
    // GET BY ID
    // =========================

    [Fact]
    public async Task GetById_ShouldReturnReview()
    {
        var review = new Review(
            1,
            1,
            10,
            5,
            "Excellent");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(review);

        var result = await _service.GetById(1);

        Assert.NotNull(result);
        Assert.Equal(5, result!.Rate);
    }

    [Fact]
    public async Task GetById_ShouldReturnNull_WhenNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Review?)null);

        var result = await _service.GetById(1);

        Assert.Null(result);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task Delete_ShouldCallRepository()
    {
        var review = new Review(
            1,
            1,
            10,
            5,
            "Great book");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(review);

        _repoMock
            .Setup(r => r.DeleteAsync(1))
            .Returns(Task.CompletedTask);

        await _service.Delete(1);

        _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    [Fact]
    public async Task Delete_ShouldThrow_WhenReviewNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((Review?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.Delete(1));
    }

    [Fact]
    public async Task Delete_ShouldDelete_WhenReviewExists()
    {
        var review = new Review(
            1,
            1,
            10,
            5,
            "Great");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(review);

        await _service.Delete(1);

        _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }
}