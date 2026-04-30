using Library.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class Tag
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public virtual List<Book> Books { get; private set; } = new();

        public Tag(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
