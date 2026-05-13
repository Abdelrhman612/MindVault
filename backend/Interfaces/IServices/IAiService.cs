using System.Text.Json;

namespace backend.Interfaces.IServices;

public interface IAiService
{
    Task<string> AskAiAsync(JsonElement requestBody);
}
