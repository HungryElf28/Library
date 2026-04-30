using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Library.Domain.Entities;
using EfBook = Library.Infrastructure.Data.Models.Book;
using EfAuthor = Library.Infrastructure.Data.Models.Author;
using EfGenre = Library.Infrastructure.Data.Models.Genre;
using EfTag = Library.Infrastructure.Data.Models.Tag;

namespace Library.Infrastructure.Mappers;

public static class BookMapper
{
    // 🔽 EF → Domain
    public static Book ToDomain(EfBook ef)
    {
        var book = new Book(
            ef.Id,
            ef.Title,
            ef.TextFile,
            ef.CoverFile,
            ef.Description
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
