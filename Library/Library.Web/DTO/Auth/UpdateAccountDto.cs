namespace Library.Web.DTO.Auth
{
    public class UpdateAccountDto
    {
        public string? Login { get; set; }
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
        public DateTime? BirthDate { get; set; }
    }
}
