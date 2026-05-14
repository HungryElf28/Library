using Library.Domain.Entities;
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
            Name = domain.Name,
        };
    }
}
