using backend.DataBase.Models;

namespace backend.Interfaces.IRepositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task<bool> ExistsAsync(string email);
    Task SaveChangesAsync();
}
