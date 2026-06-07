using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

namespace Library.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _repoMock;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _repoMock = new Mock<IUserRepository>();
        _service = new AuthService(_repoMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrow_WhenLoginExists()
    {
        // Arrange
        _repoMock
            .Setup(r => r.ExistsByLoginAsync("admin"))
            .ReturnsAsync(true);

        // Act + Assert
        await Assert.ThrowsAsync<Exception>(() =>
            _service.RegisterAsync(
                "admin",
                "admin@test.com",
                "Password1!"));
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrow_WhenEmailExists()
    {
        // Arrange
        _repoMock
            .Setup(r => r.ExistsByLoginAsync(It.IsAny<string>()))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.ExistsByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(true);

        // Act + Assert
        await Assert.ThrowsAsync<Exception>(() =>
            _service.RegisterAsync(
                "user",
                "user@test.com",
                "Password1!"));
    }

    [Fact]
    public async Task RegisterAsync_ShouldAddUser()
    {
        // Arrange
        _repoMock
            .Setup(r => r.ExistsByLoginAsync(It.IsAny<string>()))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.ExistsByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.GetRoleIdByNameAsync("User"))
            .ReturnsAsync(1);

        _repoMock
            .Setup(r => r.GetByLoginAsync("user"))
            .ReturnsAsync(new User(
                1,
                "user",
                "user@test.com",
                "User",
                null));

        // Act
        var result = await _service.RegisterAsync(
            "user",
            "user@test.com",
            "Password1!");

        // Assert
        _repoMock.Verify(
            r => r.AddAsync(
                It.IsAny<User>(),
                It.IsAny<string>(),
                1),
            Times.Once);

        Assert.NotNull(result.user);
        Assert.Equal("user", result.user.Login);
        Assert.NotEmpty(result.token);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnNull_WhenUserNotFound()
    {
        // Arrange
        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((ValueTuple<User, string>?)null);

        // Act
        var result = await _service.LoginAsync(
            "user",
            "Password1!");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnNull_WhenPasswordIncorrect()
    {
        // Arrange
        var user = new User(
            1,
            "user",
            "user@test.com",
            "User",
            null);

        var hasher = new PasswordHasher<User>();

        var hash = hasher.HashPassword(
            user,
            "CorrectPassword");

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((user, hash));

        // Act
        var result = await _service.LoginAsync(
            "user",
            "WrongPassword");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnToken_WhenCredentialsValid()
    {
        // Arrange
        var user = new User(
            1,
            "user",
            "user@test.com",
            "User",
            null);

        var hasher = new PasswordHasher<User>();

        var hash = hasher.HashPassword(
            user,
            "Password1!");

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((user, hash));

        // Act
        var result = await _service.LoginAsync(
            "user",
            "Password1!");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("user", result?.user.Login);
        Assert.NotEmpty(result?.token);
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldThrow_WhenUserNotFound()
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAccountAsync(
                1,
                null,
                null,
                null,
                null));
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldThrow_WhenLoginAlreadyTaken()
    {
        var user = new User(
            1,
            "oldLogin",
            "user@test.com",
            "User",
            null);

        var hash = new PasswordHasher<User>()
            .HashPassword(user, "Password1!");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("oldLogin"))
            .ReturnsAsync((user, hash));

        _repoMock
            .Setup(r => r.ExistsByLoginAsync("newLogin"))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAccountAsync(
                1,
                "newLogin",
                null,
                null,
                null));
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldThrow_WhenEmailAlreadyTaken()
    {
        var user = new User(
            1,
            "user",
            "old@test.com",
            "User",
            null);

        var hash = new PasswordHasher<User>()
            .HashPassword(user, "Password1!");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((user, hash));

        _repoMock
            .Setup(r => r.ExistsByEmailAsync("new@test.com"))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAccountAsync(
                1,
                null,
                "new@test.com",
                null,
                null));
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldThrow_WhenCurrentPasswordMissing()
    {
        var user = new User(
            1,
            "user",
            "user@test.com",
            "User",
            null);

        var hash = new PasswordHasher<User>()
            .HashPassword(user, "Password1!");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((user, hash));

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAccountAsync(
                1,
                null,
                null,
                null,
                "NewPassword1!"));
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldThrow_WhenCurrentPasswordInvalid()
    {
        var user = new User(
            1,
            "user",
            "user@test.com",
            "User",
            null);

        var hash = new PasswordHasher<User>()
            .HashPassword(user, "CorrectPassword1!");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("user"))
            .ReturnsAsync((user, hash));

        await Assert.ThrowsAsync<Exception>(() =>
            _service.UpdateAccountAsync(
                1,
                null,
                null,
                "WrongPassword",
                "NewPassword1!"));
    }

    [Fact]
    public async Task UpdateAccountAsync_ShouldUpdateUser()
    {
        var user = new User(
            1,
            "oldLogin",
            "old@test.com",
            "User",
            null);

        var updatedUser = new User(
            1,
            "newLogin",
            "new@test.com",
            "User",
            null);

        var hash = new PasswordHasher<User>()
            .HashPassword(user, "Password1!");

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        _repoMock
            .Setup(r => r.GetWithPasswordAsync("oldLogin"))
            .ReturnsAsync((user, hash));

        _repoMock
            .Setup(r => r.ExistsByLoginAsync("newLogin"))
            .ReturnsAsync(false);

        _repoMock
            .Setup(r => r.ExistsByEmailAsync("new@test.com"))
            .ReturnsAsync(false);

        _repoMock
            .SetupSequence(r => r.GetByIdAsync(1))
            .ReturnsAsync(user)
            .ReturnsAsync(updatedUser);

        var result = await _service.UpdateAccountAsync(
            1,
            "newLogin",
            "new@test.com",
            null,
            null);

        _repoMock.Verify(
            r => r.UpdateAccountAsync(
                1,
                "newLogin",
                "new@test.com",
                null,
                null),
            Times.Once);

        Assert.Equal("newLogin", result.Login);
        Assert.Equal("new@test.com", result.Email);
    }


}