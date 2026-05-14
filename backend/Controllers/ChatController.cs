using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Interfaces.IServices;
using backend.DataBase;
using backend.DataBase.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly AppDBContext _context;

    public ChatController(IAiService aiService, AppDBContext context)
    {
        _aiService = aiService;
        _context = context;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] ChatRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var chat = await _context.Chats
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == request.ChatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Chat not found.");

        try
        {
            // 1. Save User Message
            var userMsg = new ChatMessage { Content = request.Question, Role = "user", ChatId = chat.Id };
            _context.ChatMessages.Add(userMsg);
            await _context.SaveChangesAsync();

            // 2. Prepare History for AI Service
            var history = chat.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new { role = m.Role, content = m.Content })
                .ToList();
            
            var historyJson = JsonSerializer.Serialize(history);

            // 3. Ask AI
            var answer = await _aiService.AskAiAsync(userId, request.Question, historyJson);

            // 4. Save Assistant Message
            var assistantMsg = new ChatMessage { Content = answer, Role = "assistant", ChatId = chat.Id };
            _context.ChatMessages.Add(assistantMsg);
            await _context.SaveChangesAsync();

            return Ok(new { answer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("history/{chatId}")]
    public async Task<IActionResult> GetHistory([FromRoute] int chatId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var messages = await _context.ChatMessages
            .Where(m => m.Chat.Id == chatId && m.Chat.UserId == userId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("new")]
    public async Task<IActionResult> CreateChat([FromBody] string title)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var chat = new Chat { Title = title, UserId = userId };
        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        return Ok(chat);
    }

    [HttpGet("my-chats")]
    public async Task<IActionResult> GetMyChats()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var chats = await _context.Chats
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(chats);
    }

    [HttpDelete("{chatId}")]
    public async Task<IActionResult> DeleteChat([FromRoute] int chatId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var chat = await _context.Chats
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Chat not found.");

        // Explicitly remove messages first to avoid FK issues if cascade is off
        _context.ChatMessages.RemoveRange(chat.Messages);
        _context.Chats.Remove(chat);
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Chat deleted successfully." });
    }
}

public class ChatRequest
{
    public int ChatId { get; set; }
    public string Question { get; set; } = string.Empty;
}

