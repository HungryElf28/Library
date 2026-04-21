using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using EfAuthor = Library.Infrastructure.Data.Models.Author;

namespace Library.Infrastructure.Mappers
{
    public static class AuthorMapper
    {
        public static Author ToDomain(EfAuthor ef)
        {
            var author = new Author(
                ef.Id,
                ef.Name,
                ef.Bio,
                ef.Photo
            );

            return author;
        }

        public static EfAuthor ToEf(Author domain)
        {
            return new EfAuthor
            {
                Id = domain.Id,
                Name = domain.Name,
                Bio = domain.Bio,
                Photo = domain.Photo
            };
        }
    }
}
