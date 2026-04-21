namespace Library.Web.DTO.Books
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? CoverFile { get; set; }

        public List<string> Authors { get; set; }
    }
}
