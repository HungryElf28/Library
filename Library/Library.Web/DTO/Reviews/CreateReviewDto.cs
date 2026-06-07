using System.ComponentModel.DataAnnotations;

namespace Library.Web.DTO.Reviews
{
    public class CreateReviewDto
    {
        public int Rate { get; set; }

        [StringLength(3000, ErrorMessage = "Длина отзыва не должна превышать 3000 символов")]
        public string? Text { get; set; }
    }
}
