using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Domain.Entities
{
    public class SearchProjection
    {
        public string Type { get; set; } = null!;
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverFile { get; set; }
        public List<string>? AuthorNames { get; set; }
        public List<string>? GenreNames { get; set; }
        public double AverageRating { get; set; }
        public double Score { get; set; }
        public double TitleSimilarity { get; set; }
    }
}
