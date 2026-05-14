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

    public async Task<string> AskAiAsync(int userId, string question, string chatHistory)
    {
        var client = _httpClientFactory.CreateClient("AiService");

        var formData = new MultipartFormDataContent();
        formData.Add(new StringContent(question), "question");
        if (!string.IsNullOrEmpty(chatHistory))
        {
            formData.Add(new StringContent(chatHistory), "chat_history");
        }

        var response = await client.PostAsync($"/chat/{userId}", formData);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(result);
            return json.RootElement.GetProperty("answer").GetString() ?? "";
        }

        throw new Exception($"Error from AI Service: {response.StatusCode}");
    }

    public async Task<bool> UploadFilesAsync(int userId, IEnumerable<IFormFile> files)
    {
        var client = _httpClientFactory.CreateClient("AiService");
        using var content = new MultipartFormDataContent();

        foreach (var file in files)
        {
            var fileContent = new StreamContent(file.OpenReadStream());
            content.Add(fileContent, "files", file.FileName);
        }

        var response = await client.PostAsync($"/upload/{userId}", content);
        return response.IsSuccessStatusCode;
    }
}


