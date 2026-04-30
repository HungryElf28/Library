using System;
using System.Collections.Generic;

namespace Library.Infrastructure.Data.Models;

public partial class Review
{
    public int Id { get; set; }

    public int Rate { get; set; }

    public string? ReviewText { get; set; }

    public int UserId { get; set; }

    public int BookId { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
