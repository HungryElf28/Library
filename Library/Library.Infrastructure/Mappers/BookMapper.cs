using Library.Domain.Entities;
using EfBook = Library.Infrastructure.Data.Models.Book;

namespace Library.Infrastructure.Mappers;

public static class BookMapper
{
    public static Book ToDomain(EfBook ef)
    {
        var book = new Book(
            ef.Id,
            ef.Title,
            ef.TextFile,
            ef.CoverFile,
            ef.Description,
            ef.Rating,
            ef.Reviews.Count,
            ef.ReadCount
        );

        book.Authors.AddRange(
        ef.Authors.Select(AuthorMapper.ToDomain)
    );

        book.Genres.AddRange(
            ef.Genres.Select(GenreMapper.ToDomain)
        );

        book.Tags.AddRange(
            ef.Tags.Select(TagMapper.ToDomain)
        );

        return book;
    }

    public static EfBook ToEf(Book domain)
    {
        return new EfBook
        {
            Title = domain.Title,
            TextFile = domain.TextFile,
            CoverFile = domain.CoverFile,
            Description = domain.Description,
        };
    }
}
