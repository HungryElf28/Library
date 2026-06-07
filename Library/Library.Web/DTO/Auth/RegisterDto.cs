using System;
using System.ComponentModel.DataAnnotations;

namespace Library.Web.DTO.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Логин обязателен")]
        public string Login { get; set; } = null!;

        [Required(ErrorMessage = "Email обязателен")]
        [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Email должен содержать символ '@' и точку '.'")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$", ErrorMessage = "Пароль должен содержать минимум одну строчную латинскую букву, одну прописную латинскую букву, одну цифру и один спецсимвол")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Дата рождения обязательна")]
        public DateTime? BirthDate { get; set; }
    }
}
