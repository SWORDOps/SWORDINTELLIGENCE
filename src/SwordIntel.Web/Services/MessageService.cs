using System.Text;

namespace SwordIntel.Web.Services;

public interface IMessageService
{
    Task<string> SendMessageAsync(string roomId, string senderId, byte[] encryptedContent);
    Task<List<Message>> GetRoomMessagesAsync(string roomId, int limit = 50);
    Task<bool> DeleteExpiredMessagesAsync();
}

public class MessageService : IMessageService
{
    private readonly SwordIntelDbContext _db;
    private readonly ILogger<MessageService> _logger;

    public MessageService(SwordIntelDbContext db, ILogger<MessageService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<string> SendMessageAsync(string roomId, string senderId, byte[] encryptedContent)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null)
            throw new InvalidOperationException("Room not found");

        var message = new Message
        {
            Id = Guid.NewGuid().ToString(),
            RoomId = roomId,
            SenderId = senderId,
            EncryptedContent = encryptedContent,
            CreatedAt = DateTime.UtcNow,
            MessageNumber = await GetNextMessageNumberAsync(roomId),
            ExpiresAt = room.MessageRetentionDays.HasValue
                ? DateTime.UtcNow.AddDays(room.MessageRetentionDays.Value)
                : null
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Message {MessageId} sent to room {RoomId}", message.Id, roomId);

        return message.Id;
    }

    public async Task<List<Message>> GetRoomMessagesAsync(string roomId, int limit = 50)
    {
        return await _db.Messages
            .Where(m => m.RoomId == roomId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<bool> DeleteExpiredMessagesAsync()
    {
        var expiredMessages = await _db.Messages
            .Where(m => m.ExpiresAt != null && m.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        if (expiredMessages.Any())
        {
            _db.Messages.RemoveRange(expiredMessages);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Deleted {Count} expired messages", expiredMessages.Count);
        }

        return true;
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
