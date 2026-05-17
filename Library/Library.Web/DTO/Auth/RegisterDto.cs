namespace Library.Web.DTO.Auth
{
    public class RegisterDto
    {
        public string Login { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime? BirthDate { get; set; }
    }
}
