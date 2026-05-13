using backend.Interfaces.IServices;
using System.Text;
using System.Text.Json;

namespace backend.Services;

public class AiService : IAiService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AiService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> AskAiAsync(JsonElement requestBody)
    {
        var client = _httpClientFactory.CreateClient("AiService");

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );

        var response = await client.PostAsync("/chat", content);

        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadAsStringAsync();
        }

        throw new Exception($"Error from AI Service: {response.StatusCode}");
    }
}
