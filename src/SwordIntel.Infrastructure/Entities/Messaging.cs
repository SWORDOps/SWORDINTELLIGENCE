namespace SwordIntel.Infrastructure.Entities;

public record Room
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public bool IsPrivate { get; init; } = true;
    public required string CreatedById { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastActivityAt { get; init; }
    public bool IsEphemeral { get; init; }
    public int? MessageRetentionDays { get; init; }
}

public record RoomMembership
{
    public required string Id { get; init; }
    public required string RoomId { get; init; }
    public required string UserId { get; init; }
    public required string Role { get; init; } // owner, admin, member
    public DateTime JoinedAt { get; init; }
    public DateTime? LastReadAt { get; init; }

    // E2E encryption keys for this room
    public byte[]? EncryptedRoomKey { get; init; }
    public byte[]? RatchetState { get; init; }
}

public record Message
{
    public required string Id { get; init; }
    public required string RoomId { get; init; }
    public required string SenderId { get; init; }
    public required byte[] EncryptedContent { get; init; }
    public byte[]? Nonce { get; init; }
    public byte[]? Tag { get; init; }
    public int MessageNumber { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public bool IsDecoy { get; init; }
    public string? ReplyToId { get; init; }
    public bool IsEdited { get; init; }
    public DateTime? EditedAt { get; init; }
}

public record SearchIndex
{
    public required string Id { get; init; }
    public required string MessageId { get; init; }
    public required string EncryptedKeyword { get; init; }
    public DateTime IndexedAt { get; init; }
}
