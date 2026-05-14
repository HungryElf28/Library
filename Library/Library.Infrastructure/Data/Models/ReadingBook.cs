namespace Library.Infrastructure.Data.Models;

public partial class ReadingBook
{
    public int UserId { get; set; }

    public int BookId { get; set; }

    public int Page { get; set; }

    public int TotalPages { get; set; }

    public DateTime LastOpened { get; set; } = DateTime.UtcNow;

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
