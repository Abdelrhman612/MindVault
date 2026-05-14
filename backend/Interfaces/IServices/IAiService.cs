using System.Text.Json;

namespace backend.Interfaces.IServices;

public interface IAiService
{
    Task<string> AskAiAsync(int userId, string question, string chatHistory);
    Task<bool> UploadFilesAsync(int userId, IEnumerable<IFormFile> files);
}

