using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Infrastructure.Repositories.Models
{
    public class SearchProjection
    {
        public string Type { get; set; } = null!;
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public double Score { get; set; }
    }
}
