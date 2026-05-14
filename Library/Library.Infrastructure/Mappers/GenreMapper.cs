using Library.Domain.Entities;
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
