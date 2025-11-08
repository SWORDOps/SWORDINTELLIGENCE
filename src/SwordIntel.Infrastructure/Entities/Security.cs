namespace SwordIntel.Infrastructure.Entities;

public record CanaryToken
{
    public required string Id { get; init; }
    public required string Token { get; init; }
    public required string Type { get; init; } // dns, http, email, aws, document, cloned_site, sql, smb
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string CreatedById { get; init; }
    public DateTime CreatedAt { get; init; }
    public bool IsActive { get; init; } = true;
    public Dictionary<string, string>? Metadata { get; init; }
    public DateTime? LastTriggeredAt { get; init; }
    public int TriggerCount { get; init; } = 0;
}

public record CanaryTrigger
{
    public required string Id { get; init; }
    public required string TokenId { get; init; }
    public DateTime TriggeredAt { get; init; }
    public string? SourceIp { get; init; }
    public string? UserAgent { get; init; }
    public string? Location { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
}

public record AuditLog
{
    public required string Id { get; init; }
    public required string UserId { get; init; }
    public required string Action { get; init; }
    public required string ResourceType { get; init; }
    public string? ResourceId { get; init; }
    public DateTime Timestamp { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public Dictionary<string, object>? Metadata { get; init; }

    // Tamper-evident chain
    public string? PreviousHash { get; init; }
    public required string CurrentHash { get; init; }
}
