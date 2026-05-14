using System;
using System.Collections.Generic;

namespace Library.Infrastructure.Data.Models;

public partial class Bookmark
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int BookId { get; set; }

    public int Page { get; set; }

    public string? Cfi { get; set; }

    public int? CharOffset { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
