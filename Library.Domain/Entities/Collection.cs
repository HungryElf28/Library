using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class Collection
    {
        public int Id { get; }
        public string Title { get; private set; }
        public int UserId { get; }

        public List<Book> Books { get; private set; } = new();

        public Collection(int id, string title, int userId)
        {
            Id = id;
            Title = title;
            UserId = userId;
        }

        public void AddBook(int bookId)
        {
            if (Books.Any(b => b.Id == bookId))
                return;

            Books.Add(new Book(bookId, "", "", null, null));
        }

        public void RemoveBook(int bookId)
        {
            var book = Books.FirstOrDefault(b => b.Id == bookId);
            if (book != null)
                Books.Remove(book);
        }
    }
}
