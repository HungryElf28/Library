using Library.Domain.Entities;
using EfBookmark = Library.Infrastructure.Data.Models.Bookmark;

namespace Library.Infrastructure.Mappers;

public static class BookmarkMapper
{
    public static Bookmark ToDomain(EfBookmark ef)
    {
        return new Bookmark(
            ef.Id,
            ef.UserId,
            ef.BookId,
            ef.Page,
            ef.Cfi,
            ef.CharOffset,
            ef.Note,
            ef.CreatedAt
        );
    }

    public static EfBookmark ToEf(Bookmark domain)
    {
        return new EfBookmark
        {
            Id = domain.Id,
            UserId = domain.UserId,
            BookId = domain.BookId,
            Page = domain.Page,
            Cfi = domain.Cfi,
            CharOffset = domain.CharOffset,
            Note = domain.Note,
            CreatedAt = domain.CreatedAt
        };
    }
}
