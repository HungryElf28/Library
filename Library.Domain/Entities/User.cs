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

        public User(int id, string login, string email)
        {
            Id = id;
            Login = login;
            Email = email;
        }
    }
}
