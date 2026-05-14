using System.ComponentModel.DataAnnotations;

namespace backend.DataBase.Models;

public class ChatMessage
{
    public int Id { get; set; }
    [Required]
    public string Content { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = "user"; // user or assistant
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public int ChatId { get; set; }
    public Chat Chat { get; set; } = null!;
}
