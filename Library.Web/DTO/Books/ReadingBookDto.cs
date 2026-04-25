namespace Library.Web.DTO.Books
{
    public class ReadingBookDto
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public string? CoverFile { get; set; }
        public int Page { get; set; }
        public DateOnly LastOpened { get; set; }
    }
}
