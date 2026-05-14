using System.ComponentModel.DataAnnotations;

namespace backend.DataBase.Models;

public class Chat
{
    public int Id { get; set; }
    public string Title { get; set; } = "New Chat";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
