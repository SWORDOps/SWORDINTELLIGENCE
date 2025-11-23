namespace SwordIntel.Infrastructure.Entities;

public record Document
{
    public required string Id { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public long FileSize { get; init; }
    public required string UploadedById { get; init; }
    public DateTime UploadedAt { get; init; }

    // Encryption metadata
    public required byte[] EncryptedContent { get; init; }
    public byte[]? KyberCiphertext { get; init; }
    public byte[]? EncryptionNonce { get; init; }
    public required string EncryptionAlgorithm { get; init; }

    // Organization
    public List<string>? Tags { get; init; }
    public string? Description { get; init; }
    public int Version { get; init; } = 1;
    public string? ParentVersionId { get; init; }

    // Security
    public bool IsCanary { get; init; }
    public DateTime? ExpiresAt { get; init; }
}

public record ShareLink
{
    public required string Id { get; init; }
    public required string ShareId { get; init; }
    public required string DocumentId { get; init; }
    public required string CreatedById { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime ExpiresAt { get; init; }
    public int? MaxAccesses { get; init; }
    public int CurrentAccesses { get; init; } = 0;
    public string? PasswordHash { get; init; }
    public bool RequireAuth { get; init; }
    public bool IsActive { get; init; } = true;
}

public record DocumentVersion
{
    public required string Id { get; init; }
    public required string DocumentId { get; init; }
    public int VersionNumber { get; init; }
    public required byte[] EncryptedContent { get; init; }
    public long FileSize { get; init; }
    public required string ModifiedById { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? ChangeDescription { get; init; }
}
