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

public static class TagMapper
{
    public static Tag ToDomain(EfTag ef)
    {
        return new Tag(ef.Id, ef.Name);
    }

    public static EfTag ToEf(Tag domain)
    {
        return new EfTag
        {
            Id = domain.Id,
            Name = domain.Name,
        };
    }
}
