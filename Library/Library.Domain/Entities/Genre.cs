namespace Library.Domain.Entities
{
    public class Genre
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public virtual List<Book> Books { get; private set; } = new();

        public Genre(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
