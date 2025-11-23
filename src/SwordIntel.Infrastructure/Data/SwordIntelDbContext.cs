using Microsoft.EntityFrameworkCore;
using SwordIntel.Infrastructure.Entities;

namespace SwordIntel.Infrastructure.Data;

/// <summary>
/// Main database context for SWORD Intelligence platform
/// </summary>
public class SwordIntelDbContext : DbContext
{
    public SwordIntelDbContext(DbContextOptions<SwordIntelDbContext> options) : base(options)
    {
    }

    // User & Authentication
    public DbSet<User> Users => Set<User>();
    public DbSet<Authenticator> Authenticators => Set<Authenticator>();

    // Messaging
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomMembership> RoomMemberships => Set<RoomMembership>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SearchIndex> SearchIndexes => Set<SearchIndex>();

    // Dead Drop System
    public DbSet<DeadDrop> DeadDrops => Set<DeadDrop>();
    public DbSet<Heartbeat> Heartbeats => Set<Heartbeat>();
    public DbSet<UserLocation> UserLocations => Set<UserLocation>();

    // Document Vault
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<ShareLink> ShareLinks => Set<ShareLink>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();

    // Security
    public DbSet<CanaryToken> CanaryTokens => Set<CanaryToken>();
    public DbSet<CanaryTrigger> CanaryTriggers => Set<CanaryTrigger>();

    // Audit & Compliance
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Threat Intelligence
    public DbSet<ThreatEntry> ThreatEntries => Set<ThreatEntry>();
    public DbSet<ThreatIOC> ThreatIOCs => Set<ThreatIOC>();
    public DbSet<OSINTFeed> OSINTFeeds => Set<OSINTFeed>();
    public DbSet<OSINTIndicator> OSINTIndicators => Set<OSINTIndicator>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Authenticator configuration
        modelBuilder.Entity<Authenticator>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CredentialId).IsUnique();
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Room configuration
        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // RoomMembership configuration
        modelBuilder.Entity<RoomMembership>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RoomId, e.UserId }).IsUnique();
            entity.HasOne<Room>()
                .WithMany()
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Message configuration
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RoomId, e.CreatedAt });
            entity.HasOne<Room>()
                .WithMany()
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // DeadDrop configuration
        modelBuilder.Entity<DeadDrop>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Identifier).IsUnique();
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document configuration
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UploadedAt);
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UploadedById)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ShareLink configuration
        modelBuilder.Entity<ShareLink>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ShareId).IsUnique();
            entity.HasOne<Document>()
                .WithMany()
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CanaryToken configuration
        modelBuilder.Entity<CanaryToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AuditLog configuration (tamper-evident)
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => new { e.UserId, e.Timestamp });
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ThreatIOC configuration
        modelBuilder.Entity<ThreatIOC>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.Type, e.Value });
        });

        // OSINTIndicator configuration
        modelBuilder.Entity<OSINTIndicator>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.Type, e.Value });
            entity.HasIndex(e => e.LastSeen);
        });
    }
}
