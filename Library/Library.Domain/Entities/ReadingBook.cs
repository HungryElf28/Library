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
        public int TotalPages { get; }
        public DateTime LastOpened { get; }

        public ReadingBook(int bookId, string title, string? coverFile, int page, int totalPages, DateTime lastOpened)
        {
            BookId = bookId;
            Title = title;
            CoverFile = coverFile;
            Page = page;
            TotalPages = totalPages;
            LastOpened = lastOpened;
        }
    }

}
