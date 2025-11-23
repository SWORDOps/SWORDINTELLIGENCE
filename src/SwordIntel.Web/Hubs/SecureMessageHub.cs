using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SwordIntel.Web.Hubs;

[Authorize]
public class SecureMessageHub : Hub
{
    private readonly SwordIntelDbContext _db;
    private readonly ILogger<SecureMessageHub> _logger;

    public SecureMessageHub(SwordIntelDbContext db, ILogger<SecureMessageHub> logger)
    {
        _db = db;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation("User {UserId} connected to messaging hub", userId);

        // Join user's rooms
        var memberships = await _db.RoomMemberships
            .Where(m => m.UserId == userId)
            .ToListAsync();

        foreach (var membership in memberships)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, membership.RoomId);
        }

        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string roomId, byte[] encryptedContent, byte[] nonce, byte[]? tag)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) return;

        // Verify user is member of room
        var isMember = await _db.RoomMemberships
            .AnyAsync(m => m.RoomId == roomId && m.UserId == userId);

        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to send message to unauthorized room {RoomId}", userId, roomId);
            return;
        }

        // Save message
        var message = new Message
        {
            Id = Guid.NewGuid().ToString(),
            RoomId = roomId,
            SenderId = userId,
            EncryptedContent = encryptedContent,
            Nonce = nonce,
            Tag = tag,
            MessageNumber = await GetNextMessageNumberAsync(roomId),
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        // Broadcast to room
        await Clients.Group(roomId).SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.RoomId,
            message.SenderId,
            message.EncryptedContent,
            message.Nonce,
            message.Tag,
            message.MessageNumber,
            message.CreatedAt
        });

        _logger.LogInformation("Message {MessageId} sent to room {RoomId}", message.Id, roomId);
    }

    public async Task JoinRoom(string roomId)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) return;

        var isMember = await _db.RoomMemberships
            .AnyAsync(m => m.RoomId == roomId && m.UserId == userId);

        if (isMember)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            _logger.LogInformation("User {UserId} joined room {RoomId}", userId, roomId);
        }
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        _logger.LogInformation("User {UserId} left room {RoomId}", Context.UserIdentifier, roomId);
    }

    public async Task SendTypingIndicator(string roomId)
    {
        await Clients.OthersInGroup(roomId).SendAsync("UserTyping", Context.UserIdentifier);
    }

    private async Task<int> GetNextMessageNumberAsync(string roomId)
    {
        var lastMessage = await _db.Messages
            .Where(m => m.RoomId == roomId)
            .OrderByDescending(m => m.MessageNumber)
            .FirstOrDefaultAsync();

        return (lastMessage?.MessageNumber ?? 0) + 1;
    }
}

[Authorize]
public class IntelligenceFeedHub : Hub
{
    private readonly ILogger<IntelligenceFeedHub> _logger;

    public IntelligenceFeedHub(ILogger<IntelligenceFeedHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "intelligence-feed");
        _logger.LogInformation("User {UserId} subscribed to intelligence feed", Context.UserIdentifier);
        await base.OnConnectedAsync();
    }

    public async Task SubscribeToCategory(string category)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"intel-{category}");
        _logger.LogInformation("User {UserId} subscribed to category {Category}", Context.UserIdentifier, category);
    }
}
