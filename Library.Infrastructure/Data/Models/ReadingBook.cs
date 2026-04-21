using System;
using System.Collections.Generic;

namespace Library.Infrastructure.Data.Models;

public partial class ReadingBook
{
    public int UserId { get; set; }

    public int BookId { get; set; }

    public int Page { get; set; }

    public DateOnly LastOpened { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
