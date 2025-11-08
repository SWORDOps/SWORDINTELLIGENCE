namespace SwordIntel.Infrastructure.Entities;

public record User
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public string? Name { get; init; }
    public string? PasswordHash { get; init; }
    public string? Role { get; init; }
    public bool IsActive { get; init; } = true;
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }

    // Post-Quantum Crypto keys
    public byte[]? KyberPublicKey { get; init; }
    public byte[]? DilithiumPublicKey { get; init; }

    // MFA settings
    public string? TotpSecret { get; init; }
    public bool MfaEnabled { get; init; }
}

public record Authenticator
{
    public required string Id { get; init; }
    public required string UserId { get; init; }
    public required string CredentialId { get; init; }
    public required byte[] PublicKey { get; init; }
    public required byte[] CredentialPublicKey { get; init; }
    public int Counter { get; init; }
    public required string CredentialType { get; init; }
    public required List<string> Transports { get; init; }
    public bool IsBackupEligible { get; init; }
    public bool IsBackedUp { get; init; }
    public string? AttestationObject { get; init; }
    public string? AttestationClientDataJson { get; init; }
    public string? Name { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastUsedAt { get; init; }
}
