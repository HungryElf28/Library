using System;
using System.ComponentModel.DataAnnotations;

namespace Library.Web.DTO.Auth
{
    public class UpdateAccountDto
    {
        public string? Login { get; set; }

        [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Email должен содержать символ '@' и точку '.'")]
        public string? Email { get; set; }

        public string? CurrentPassword { get; set; }

        [MinLength(6, ErrorMessage = "Новый пароль должен быть не менее 6 символов")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$", ErrorMessage = "Пароль должен содержать минимум одну строчную латинскую букву, одну прописную латинскую букву, одну цифру и один спецсимвол")]
        public string? NewPassword { get; set; }

        public DateTime? BirthDate { get; set; }
    }
}
