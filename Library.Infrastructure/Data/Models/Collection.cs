using System;
using System.Collections.Generic;

namespace Library.Infrastructure.Data.Models;

public partial class Collection
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}
