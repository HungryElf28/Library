using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Library.Application.Services;

public class AuthService
{
    private readonly IUserRepository _repo;

    public AuthService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<(string token, User user)> RegisterAsync(string login, string email, string password, DateTime? birthDate = null)
    {
        if (await _repo.ExistsByLoginAsync(login))
            throw new Exception("User with this login already exists");

        if (await _repo.ExistsByEmailAsync(email))
            throw new Exception("User with this email already exists");

        var user = new User(0, login, email, null, birthDate);

        var hasher = new PasswordHasher<User>();
        var hash = hasher.HashPassword(user, password);
        var roleId = await _repo.GetRoleIdByNameAsync("User");

        await _repo.AddAsync(user, hash, roleId);

        var createdUser = await _repo.GetByLoginAsync(login);
        if (createdUser == null) throw new Exception("Error creating user");

        return (GenerateToken(createdUser), createdUser);
    }

    public async Task<(string token, User user)?> LoginAsync(string login, string password)
    {
        var data = await _repo.GetWithPasswordAsync(login);

        if (data == null)
            return null;

        var (user, hash) = data.Value;

        var hasher = new PasswordHasher<User>();

        var result = hasher.VerifyHashedPassword(user, hash, password);

        if (result == PasswordVerificationResult.Failed)
            return null;

        return (GenerateToken(user), user);
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.RoleName)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User> UpdateAccountAsync(int userId, string? login, string? email, string? currentPassword, string? newPassword, DateTime? birthDate = null)
    {
        var data = await _repo.GetWithPasswordAsync(await _repo.GetByIdAsync(userId).ContinueWith(t => t.Result?.Login ?? ""));
        if (data == null) throw new Exception("User not found");

        var (user, hash) = data.Value;
        
        string updatedLogin = login ?? user.Login;
        string updatedEmail = email ?? user.Email;
        string? updatedPasswordHash = null;

        if (!string.IsNullOrEmpty(login) && login != user.Login)
        {
            if (await _repo.ExistsByLoginAsync(login))
                throw new Exception("Login already taken");
        }

        if (!string.IsNullOrEmpty(email) && email != user.Email)
        {
            if (await _repo.ExistsByEmailAsync(email))
                throw new Exception("Email already taken");
        }

        if (!string.IsNullOrEmpty(newPassword))
        {
            if (string.IsNullOrEmpty(currentPassword))
                throw new Exception("Current password is required to set a new one");

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, hash, currentPassword);
            if (result == PasswordVerificationResult.Failed)
                throw new Exception("Invalid current password");

            updatedPasswordHash = hasher.HashPassword(user, newPassword);
        }

        await _repo.UpdateAccountAsync(userId, updatedLogin, updatedEmail, updatedPasswordHash, birthDate);
        
        var updatedUser = await _repo.GetByIdAsync(userId);
        return updatedUser ?? throw new Exception("Error updating user");
    }
}
