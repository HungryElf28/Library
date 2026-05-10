namespace Library.Web.DTO.Common
{
    public class PagedResponseDto<T>
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<T> Items { get; set; } = new();

        public static PagedResponseDto<T> Create(IEnumerable<T> items, int total, int page, int pageSize)
        {
            return new PagedResponseDto<T>
            {
                Items = items.ToList(),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
