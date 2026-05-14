using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Interfaces.IServices;
using backend.DataBase;
using backend.DataBase.Models;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PdfController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly AppDBContext _context;

    public PdfController(IAiService aiService, AppDBContext context)
    {
        _aiService = aiService;
        _context = context;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IEnumerable<IFormFile> files)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        if (files == null || !files.Any())
            return BadRequest("No files uploaded.");

        try
        {
            // 1. Forward to AI Service
            var success = await _aiService.UploadFilesAsync(userId, files);
            if (!success)
                return StatusCode(500, "Failed to process PDFs in AI Service.");

            // 2. Save metadata in SQL Server
            foreach (var file in files)
            {
                var pdfFile = new PdfFile
                {
                    FileName = file.FileName,
                    UserId = userId,
                    UploadedAt = DateTime.UtcNow
                };
                _context.PdfFiles.Add(pdfFile);
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Files uploaded and processed successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("my-files")]
    public IActionResult GetMyFiles()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var files = _context.PdfFiles
            .Where(f => f.UserId == userId)
            .Select(f => new { f.Id, f.FileName, f.UploadedAt })
            .ToList();

        return Ok(files);
    }
}
