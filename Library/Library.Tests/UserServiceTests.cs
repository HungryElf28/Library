using Moq;
using Xunit;
using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Tests;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _repoMock = new Mock<IUserRepository>();
        _service = new UserService(_repoMock.Object);
    }

    // =========================
    // FAVORITES
    // =========================

    [Fact]
    public async Task AddToFavorites_ShouldCallRepository()
    {
        await _service.AddToFavorites(1, 10);

        _repoMock.Verify(
            r => r.AddToFavoritesAsync(1, 10),
            Times.Once);
    }

    [Fact]
    public async Task RemoveFromFavorites_ShouldCallRepository()
    {
        await _service.RemoveFromFavorites(1, 10);

        _repoMock.Verify(
            r => r.RemoveFromFavoritesAsync(1, 10),
            Times.Once);
    }

    [Fact]
    public async Task GetFavorites_ShouldReturnBooks()
    {
        var books = new List<Book>();

        _repoMock
            .Setup(r => r.GetFavoritesAsync(1))
            .ReturnsAsync(books);

        var result = await _service.GetFavorites(1);

        Assert.Same(books, result);
    }

    // =========================
    // USERS
    // =========================

    [Fact]
    public async Task GetById_ShouldReturnUser()
    {
        var user = new User(
            1,
            "admin",
            "admin@test.com",
            "Admin",
            null);

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
    }

    [Fact]
    public async Task GetAllUsers_ShouldReturnUsers()
    {
        var users = new List<User>
        {
            new User(1, "user1", "u1@test.com", "User", null),
            new User(2, "user2", "u2@test.com", "User", null)
        };

        _repoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(users);

        var result = await _service.GetAllUsers();

        Assert.Equal(2, result.Count);
    }

    // =========================
    // READING
    // =========================

    [Fact]
    public async Task GetReading_ShouldReturnReadingBooks()
    {
        var reading = new List<ReadingBook>();

        _repoMock
            .Setup(r => r.GetReadingAsync(1))
            .ReturnsAsync(reading);

        var result = await _service.GetReading(1);

        Assert.Same(reading, result);
    }

    [Fact]
    public async Task SaveProgress_ShouldCallRepository()
    {
        await _service.SaveProgress(
            1,
            10,
            50,
            100,
            500);

        _repoMock.Verify(
            r => r.SaveProgressAsync(
                1,
                10,
                50,
                100,
                500),
            Times.Once);
    }

    [Fact]
    public async Task GetProgress_ShouldReturnProgress()
    {
        var progress = new ReadingBook(
            10,
            "The Hobbit",
            null,
            50,
            100,
            500,
            DateTime.UtcNow);

        _repoMock
            .Setup(r => r.GetProgressAsync(1, 10))
            .ReturnsAsync(progress);

        var result = await _service.GetProgress(1, 10);

        Assert.NotNull(result);
        Assert.Equal(10, result!.BookId);
    }

    // =========================
    // SUBSCRIPTION
    // =========================

    [Fact]
    public async Task UpdateSubscription_ShouldCallRepository()
    {
        var expires = DateTime.UtcNow.AddMonths(1);

        await _service.UpdateSubscription(
            1,
            true,
            expires);

        _repoMock.Verify(
            r => r.UpdateSubscriptionAsync(
                1,
                true,
                expires),
            Times.Once);
    }

    // =========================
    // AVATAR
    // =========================

    [Fact]
    public async Task UpdateAvatar_ShouldCallRepository()
    {
        await _service.UpdateAvatar(
            1,
            "avatar.jpg");

        _repoMock.Verify(
            r => r.UpdateAvatarAsync(
                1,
                "avatar.jpg"),
            Times.Once);
    }

    // =========================
    // DELETE
    // =========================

    [Fact]
    public async Task DeleteUser_ShouldCallRepository()
    {
        await _service.DeleteUser(1);

        _repoMock.Verify(
            r => r.DeleteAsync(1),
            Times.Once);
    }

    // =========================
    // ROLE
    // =========================

    [Fact]
    public async Task ChangeRole_ShouldCallRepository()
    {
        await _service.ChangeRole(
            1,
            "Admin");

        _repoMock.Verify(
            r => r.ChangeRoleAsync(
                1,
                "Admin"),
            Times.Once);
    }
}