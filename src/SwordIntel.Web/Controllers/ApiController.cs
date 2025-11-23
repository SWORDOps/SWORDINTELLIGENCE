using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SwordIntel.Web.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            framework = ".NET 8.0",
            crypto = "ML-KEM-1024 + ML-DSA-87"
        });
    }
}

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesApiController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesApiController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpGet("rooms/{roomId}")]
    public async Task<IActionResult> GetRoomMessages(string roomId, [FromQuery] int limit = 50)
    {
        var messages = await _messageService.GetRoomMessagesAsync(roomId, limit);
        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var messageId = await _messageService.SendMessageAsync(
            request.RoomId,
            userId,
            request.EncryptedContent);

        return Ok(new { messageId });
    }
}

public record SendMessageRequest(string RoomId, byte[] EncryptedContent);

[ApiController]
[Route("api/vault")]
[Authorize]
public class VaultApiController : ControllerBase
{
    private readonly IVaultService _vaultService;

    public VaultApiController(IVaultService vaultService)
    {
        _vaultService = vaultService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var content = ms.ToArray();

        // In production, encrypt on client side before upload
        var documentId = await _vaultService.UploadDocumentAsync(
            file.FileName,
            file.ContentType,
            content,
            userId);

        return Ok(new { documentId });
    }

    [HttpGet("download/{documentId}")]
    public async Task<IActionResult> Download(string documentId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var content = await _vaultService.DownloadDocumentAsync(documentId, userId);
        if (content == null) return NotFound();

        var document = await _vaultService.GetDocumentAsync(documentId);
        if (document == null) return NotFound();

        return File(content, document.ContentType, document.FileName);
    }

    [HttpPost("share")]
    public async Task<IActionResult> CreateShareLink([FromBody] CreateShareLinkRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var shareId = await _vaultService.CreateShareLinkAsync(
            request.DocumentId,
            userId,
            request.ExpiresAt,
            request.MaxAccesses);

        return Ok(new { shareId, url = $"/s/{shareId}" });
    }
}

public record CreateShareLinkRequest(string DocumentId, DateTime ExpiresAt, int? MaxAccesses);

[ApiController]
[Route("api/intelligence")]
[Authorize]
public class IntelligenceApiController : ControllerBase
{
    private readonly IOSINTService _osintService;

    public IntelligenceApiController(IOSINTService osintService)
    {
        _osintService = osintService;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string? type = null)
    {
        var indicators = await _osintService.SearchIndicatorsAsync(query, type);
        return Ok(indicators);
    }

    [HttpPost("sync")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> TriggerSync()
    {
        await _osintService.SyncFeedsAsync();
        return Ok(new { message = "Sync triggered" });
    }
}

[ApiController]
[Route("api/canary")]
public class CanaryApiController : ControllerBase
{
    private readonly ICanaryTokenService _canaryService;
    private readonly ILogger<CanaryApiController> _logger;

    public CanaryApiController(ICanaryTokenService canaryService, ILogger<CanaryApiController> logger)
    {
        _canaryService = canaryService;
        _logger = logger;
    }

    [HttpGet("beacon/{tokenId}")]
    public async Task<IActionResult> TriggerBeacon(string tokenId)
    {
        var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        await _canaryService.RecordTriggerAsync(tokenId, sourceIp, userAgent);

        _logger.LogWarning("🚨 Canary token {TokenId} triggered from {IP}", tokenId, sourceIp);

        // Return innocent-looking response
        return Ok(new { status = "ok" });
    }

    [HttpGet("pixel/{tokenId}.png")]
    public async Task<IActionResult> TrackingPixel(string tokenId)
    {
        var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        await _canaryService.RecordTriggerAsync(tokenId, sourceIp, userAgent);

        // Return 1x1 transparent PNG
        var pixel = Convert.FromBase64String(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        return File(pixel, "image/png");
    }

    [HttpPost("tokens")]
    [Authorize]
    public async Task<IActionResult> CreateToken([FromBody] CreateTokenRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var token = await _canaryService.CreateTokenAsync(request.Type, request.Name, userId);

        return Ok(new { token, url = $"/api/canary/beacon/{token}" });
    }
}

public record CreateTokenRequest(string Type, string Name);
