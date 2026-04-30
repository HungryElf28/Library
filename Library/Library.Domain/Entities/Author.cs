using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class Author
    {
        public int Id { get; }
        public string Name { get; }

        public string? Bio { get; }

        public string? Photo { get; }

        public Author(int id, string name, string? bio, string? photo)
        {
            Id = id;
            Name = name;
            Bio = bio;
            Photo = photo;
        }
    }
}
