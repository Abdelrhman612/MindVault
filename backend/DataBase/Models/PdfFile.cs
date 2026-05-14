using System.ComponentModel.DataAnnotations;

namespace backend.DataBase.Models;

public class PdfFile
{
    public int Id { get; set; }
    [Required]
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
