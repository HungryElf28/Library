namespace Library.Web.DTO.Common
{
    public class PaginationQueryDto
    {
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public int NormalizedPage => Page < 1 ? 1 : Page;
        public int NormalizedPageSize => PageSize < 1 ? 10 : Math.Min(PageSize, 100);
    }
}
