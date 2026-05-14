namespace Library.Domain.Entities
{
    public class Bookmark
    {
        public int Id { get; }
        public int UserId { get; }
        public int BookId { get; }
        public int Page { get; }
        public string? Cfi { get; }
        public int? CharOffset { get; }
        public string? Note { get; }
        public DateTime CreatedAt { get; }

        public Bookmark(int id, int userId, int bookId, int page, string? cfi, int? charOffset, string? note, DateTime createdAt)
        {
            Id = id;
            UserId = userId;
            BookId = bookId;
            Page = page;
            Cfi = cfi;
            CharOffset = charOffset;
            Note = note;
            CreatedAt = createdAt;
        }
    }
}
