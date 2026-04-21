using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Library.Application.Services;

public class AuthService
{
    private readonly IUserRepository _repo;

    public AuthService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task RegisterAsync(string login, string email, string password)
    {
        if (await _repo.ExistsByLoginAsync(login))
            throw new Exception("User already exists");

        var user = new User(0, login, email);

        var hasher = new PasswordHasher<User>();
        var hash = hasher.HashPassword(user, password);

        await _repo.AddAsync(user, hash);
    }

    public async Task<string?> LoginAsync(string login, string password)
    {
        var data = await _repo.GetWithPasswordAsync(login);

        if (data == null)
            return null;

        var (user, hash) = data.Value;

        var hasher = new PasswordHasher<User>();

        var result = hasher.VerifyHashedPassword(user, hash, password);

        if (result == PasswordVerificationResult.Failed)
            return null;

        return GenerateToken(user);
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("SUPER_SECRET_KEY"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}