using Library.Domain.Entities;
using EfUser = Library.Infrastructure.Data.Models.User;

namespace Library.Infrastructure.Mappers;

public static class UserMapper
{
    public static User ToDomain(EfUser ef)
    {
        return new User(
            ef.Id,
            ef.Login,
            ef.Email,
            ef.AvatarFile,
            ef.Role?.Role1 ?? "User",
            ef.IsSubscribed,
            ef.SubscriptionExpiresAt
        );
    }
}