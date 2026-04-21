namespace Library.Web.DTO.Books
{
    public class UpdateBookDto
    {
        public string Title { get; set; }
        public string TextFile { get; set; }
        public string? CoverFile { get; set; }
        public string? Description { get; set; }

        public List<int> AuthorIds { get; set; } = new();
        public List<int> GenreIds { get; set; } = new();
        public List<int> TagIds { get; set; } = new();
    }
}
