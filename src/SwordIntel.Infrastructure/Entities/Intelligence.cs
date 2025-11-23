namespace SwordIntel.Infrastructure.Entities;

public record ThreatEntry
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string Severity { get; init; } // critical, high, medium, low, info
    public required string Category { get; init; } // malware, phishing, c2, exploit, etc
    public DateTime FirstSeen { get; init; }
    public DateTime LastSeen { get; init; }
    public bool IsActive { get; init; } = true;
    public Dictionary<string, string>? Metadata { get; init; }
}

public record ThreatIOC
{
    public required string Id { get; init; }
    public required string ThreatEntryId { get; init; }
    public required string Type { get; init; } // ip, domain, url, hash, email, etc
    public required string Value { get; init; }
    public int Confidence { get; init; } // 0-100
    public DateTime FirstSeen { get; init; }
    public DateTime LastSeen { get; init; }
}

public record OSINTFeed
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Url { get; init; }
    public required string Type { get; init; } // malware, phishing, threat_intel, etc
    public required string Format { get; init; } // csv, json, xml, etc
    public bool IsActive { get; init; } = true;
    public DateTime? LastSyncedAt { get; init; }
    public int? SyncIntervalMinutes { get; init; }
    public Dictionary<string, string>? Config { get; init; }
}

public record OSINTIndicator
{
    public required string Id { get; init; }
    public required string FeedId { get; init; }
    public required string Type { get; init; } // ip, domain, url, hash, etc
    public required string Value { get; init; }
    public string? Description { get; init; }
    public string? Severity { get; init; }
    public int? Confidence { get; init; }
    public DateTime FirstSeen { get; init; }
    public DateTime LastSeen { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
}
