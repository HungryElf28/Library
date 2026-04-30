namespace Library.Web.DTO.Books
{
    public class BookDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string TextFile { get; set; }
        public string? CoverFile { get; set; }
        public string? Description { get; set; }

        public List<string> Authors { get; set; }
        public List<string> Genres { get; set; }
        public List<string> Tags { get; set; }
    }
}
