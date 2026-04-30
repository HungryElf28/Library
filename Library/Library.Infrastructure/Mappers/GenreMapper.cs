using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using EfBook = Library.Infrastructure.Data.Models.Book;
using EfGenre = Library.Infrastructure.Data.Models.Genre;

namespace Library.Infrastructure.Mappers
{
    public static class GenreMapper
    {
        public static Genre ToDomain(EfGenre ef)
        {
            return new Genre(ef.Id, ef.Name);
        }

        public static EfGenre ToEf(Genre domain)
        {
            return new EfGenre
            {
                Name = domain.Name,
            };
        }
    }
}
