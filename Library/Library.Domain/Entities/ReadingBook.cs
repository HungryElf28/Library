namespace Library.Domain.Entities
{
    public class ReadingBook
    {
        public int BookId { get; }
        public string Title { get; }
        public string? CoverFile { get; }
        public int Page { get; }
        public int? CharOffset { get; }
        public int TotalPages { get; }
        public DateTime LastOpened { get; }

        public ReadingBook(int bookId, string title, string? coverFile, int page, int? charOffset, int totalPages, DateTime lastOpened)
        {
            BookId = bookId;
            Title = title;
            CoverFile = coverFile;
            Page = page;
            CharOffset = charOffset;
            TotalPages = totalPages;
            LastOpened = lastOpened;
        }
    }

}
