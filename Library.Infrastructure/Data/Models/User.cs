using System;
using System.Collections.Generic;

namespace Library.Infrastructure.Data.Models;

public partial class User
{
    public int Id { get; set; }

    public string Login { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string NormalizedEmail { get; set; } = null!;

    public string NormalizedLogin { get; set; } = null!;

    public int RoleId { get; set; }

    public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();

    public virtual ICollection<Collection> Collections { get; set; } = new List<Collection>();

    public virtual ICollection<ReadingBook> ReadingBooks { get; set; } = new List<ReadingBook>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}
