using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.DataBase;

public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
}
