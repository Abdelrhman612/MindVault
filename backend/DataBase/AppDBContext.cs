using Microsoft.EntityFrameworkCore;
using backend.DataBase.Models;

namespace backend.DataBase;

public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Chat> Chats { get; set; } = null!;
    public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
    public DbSet<PdfFile> PdfFiles { get; set; } = null!;
}

