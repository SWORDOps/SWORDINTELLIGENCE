namespace SwordIntel.Web.Services;

public interface IVaultService
{
    Task<string> UploadDocumentAsync(string fileName, string contentType, byte[] encryptedContent, string uploadedById);
    Task<Document?> GetDocumentAsync(string documentId);
    Task<byte[]?> DownloadDocumentAsync(string documentId, string userId);
    Task<string> CreateShareLinkAsync(string documentId, string createdById, DateTime expiresAt, int? maxAccesses = null);
}

public class VaultService : IVaultService
{
    private readonly SwordIntelDbContext _db;
    private readonly ILogger<VaultService> _logger;

    public VaultService(SwordIntelDbContext db, ILogger<VaultService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<string> UploadDocumentAsync(string fileName, string contentType, byte[] encryptedContent, string uploadedById)
    {
        var document = new Document
        {
            Id = Guid.NewGuid().ToString(),
            FileName = fileName,
            ContentType = contentType,
            FileSize = encryptedContent.Length,
            EncryptedContent = encryptedContent,
            UploadedById = uploadedById,
            UploadedAt = DateTime.UtcNow,
            EncryptionAlgorithm = "AES-256-GCM + ML-KEM-1024",
            Version = 1
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Document {DocumentId} uploaded by {UserId}", document.Id, uploadedById);

        return document.Id;
    }

    public async Task<Document?> GetDocumentAsync(string documentId)
    {
        return await _db.Documents.FindAsync(documentId);
    }

    public async Task<byte[]?> DownloadDocumentAsync(string documentId, string userId)
    {
        var document = await _db.Documents.FindAsync(documentId);
        if (document == null) return null;

        // Check permissions (simplified - in production, check ACLs)
        if (document.UploadedById != userId)
        {
            _logger.LogWarning("User {UserId} attempted unauthorized download of {DocumentId}", userId, documentId);
            return null;
        }

        return document.EncryptedContent;
    }

    public async Task<string> CreateShareLinkAsync(string documentId, string createdById, DateTime expiresAt, int? maxAccesses = null)
    {
        var shareId = Guid.NewGuid().ToString("N")[..12];

        var shareLink = new ShareLink
        {
            Id = Guid.NewGuid().ToString(),
            ShareId = shareId,
            DocumentId = documentId,
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            MaxAccesses = maxAccesses,
            CurrentAccesses = 0,
            IsActive = true
        };

        _db.ShareLinks.Add(shareLink);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Share link {ShareId} created for document {DocumentId}", shareId, documentId);

        return shareId;
    }
}
