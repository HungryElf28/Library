using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class User
    {
        public int Id { get; }
        public string Login { get; }
        public string Email { get; }
        public string RoleName { get; }
        public bool IsSubscribed { get; }
        public DateTime? SubscriptionExpiresAt { get; }

        public User(int id, string login, string email, string roleName = "User", bool isSubscribed = false, DateTime? subscriptionExpiresAt = null)
        {
            Id = id;
            Login = login;
            Email = email;
            RoleName = roleName;
            IsSubscribed = isSubscribed;
            SubscriptionExpiresAt = subscriptionExpiresAt;
        }
    }
}
