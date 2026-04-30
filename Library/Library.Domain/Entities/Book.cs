using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{

    public class Book
    {
        public int Id { get; private set; }

        public string Title { get; private set; }
        public string TextFile { get; private set; }
        public string? CoverFile { get; private set; }
        public string? Description { get; private set; }
        public List<Author> Authors { get; private set; } = new();
        public List<Genre> Genres { get; private set; } = new();
        public List<Tag> Tags { get; private set; } = new();

        public Book(int id, string title, string textFile, string? coverFile, string? description)
        {
            Id = id;
            Title = title;
            TextFile = textFile;
            CoverFile = coverFile;
            Description = description;
        }

        public void AddAuthor(Author author)
        {
            if (!Authors.Any(a => a.Id == author.Id))
                Authors.Add(author);
        }

        public void AddGenre(Genre genre)
        {
            if (!Genres.Any(g => g.Id == genre.Id))
                Genres.Add(genre);
        }

        public void AddTag(Tag tag)
        {
            if (!Tags.Any(t => t.Id == tag.Id))
                Tags.Add(tag);
        }
    }

    public enum BookSortBy
    {
        Title,
        Rate
    }

    public enum BookSortOrder
    {
        Asc,
        Desc
    }
}
