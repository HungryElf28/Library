using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class Review
    {
        public int Id { get; }
        public int UserId { get; }
        public int BookId { get; }

        public int Rate { get; }
        public string? Text { get; }

        public Review(int id, int userId, int bookId, int rate, string? text)
        {
            if (rate < 0 || rate > 5)
                throw new ArgumentException("Rate must be 0-5");

            Id = id;
            UserId = userId;
            BookId = bookId;
            Rate = rate;
            Text = text;
        }
    }
}
