namespace SwordIntel.Infrastructure.Entities;

public record DeadDrop
{
    public required string Id { get; init; }
    public required string Identifier { get; init; }
    public required string CreatedById { get; init; }
    public required byte[] EncryptedPayload { get; init; }
    public byte[]? EncryptionNonce { get; init; }

    // Trigger configuration
    public required string TriggerType { get; init; } // time, heartbeat, location, composite
    public DateTime? TriggerTime { get; init; }
    public int? HeartbeatIntervalMinutes { get; init; }
    public int? HeartbeatMissedCount { get; init; }
    public double? TriggerLatitude { get; init; }
    public double? TriggerLongitude { get; init; }
    public double? TriggerRadiusMeters { get; init; }

    // Status
    public required string Status { get; init; } // pending, delivered, cancelled, failed
    public DateTime CreatedAt { get; init; }
    public DateTime? DeliveredAt { get; init; }
    public bool RequireConfirmation { get; init; }
    public int MaxAttempts { get; init; } = 3;
    public int CurrentAttempts { get; init; } = 0;

    // Self-destruct
    public bool SelfDestruct { get; init; } = true;
    public DateTime? ExpiresAt { get; init; }
}

public record Heartbeat
{
    public required string Id { get; init; }
    public required string UserId { get; init; }
    public DateTime Timestamp { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
}

public record UserLocation
{
    public required string Id { get; init; }
    public required string UserId { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public double? Accuracy { get; init; }
    public DateTime Timestamp { get; init; }
}
