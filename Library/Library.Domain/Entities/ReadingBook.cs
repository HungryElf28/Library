using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class ReadingBook
    {
        public int BookId { get; }
        public string Title { get; }
        public string? CoverFile { get; }
        public int Page { get; }
        public DateOnly LastOpened { get; }

        public ReadingBook(int bookId, string title, string? coverFile, int page, DateOnly lastOpened)
        {
            BookId = bookId;
            Title = title;
            CoverFile = coverFile;
            Page = page;
            LastOpened = lastOpened;
        }
    }

}
