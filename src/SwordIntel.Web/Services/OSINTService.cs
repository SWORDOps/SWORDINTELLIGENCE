namespace SwordIntel.Web.Services;

public interface IOSINTService
{
    Task<List<OSINTIndicator>> SearchIndicatorsAsync(string query, string? type = null);
    Task SyncFeedsAsync();
}

public class OSINTService : IOSINTService
{
    private readonly SwordIntelDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<OSINTService> _logger;

    public OSINTService(
        SwordIntelDbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<OSINTService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<List<OSINTIndicator>> SearchIndicatorsAsync(string query, string? type = null)
    {
        var queryable = _db.OSINTIndicators.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            queryable = queryable.Where(i => i.Type == type);
        }

        queryable = queryable.Where(i => i.Value.Contains(query));

        return await queryable
            .OrderByDescending(i => i.LastSeen)
            .Take(100)
            .ToListAsync();
    }

    public async Task SyncFeedsAsync()
    {
        var feeds = await _db.OSINTFeeds.Where(f => f.IsActive).ToListAsync();

        foreach (var feed in feeds)
        {
            try
            {
                await SyncFeedAsync(feed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing feed {FeedName}", feed.Name);
            }
        }
    }

    private async Task SyncFeedAsync(OSINTFeed feed)
    {
        var client = _httpClientFactory.CreateClient("OSINTClient");
        var response = await client.GetStringAsync(feed.Url);

        // Parse response based on format
        // This is simplified - in production, implement proper parsers for each format
        var indicators = feed.Format.ToLower() switch
        {
            "csv" => ParseCsv(response, feed),
            "json" => ParseJson(response, feed),
            _ => new List<OSINTIndicator>()
        };

        // Upsert indicators
        foreach (var indicator in indicators)
        {
            var existing = await _db.OSINTIndicators
                .FirstOrDefaultAsync(i => i.FeedId == feed.Id && i.Value == indicator.Value);

            if (existing != null)
            {
                // Update last seen
                existing = existing with { LastSeen = DateTime.UtcNow };
                _db.OSINTIndicators.Update(existing);
            }
            else
            {
                _db.OSINTIndicators.Add(indicator);
            }
        }

        // Update feed sync time
        var updatedFeed = feed with { LastSyncedAt = DateTime.UtcNow };
        _db.OSINTFeeds.Update(updatedFeed);

        await _db.SaveChangesAsync();

        _logger.LogInformation("Synced {Count} indicators from {FeedName}", indicators.Count, feed.Name);
    }

    private List<OSINTIndicator> ParseCsv(string content, OSINTFeed feed)
    {
        // Simplified CSV parser
        var lines = content.Split('\n').Skip(1); // Skip header
        var indicators = new List<OSINTIndicator>();

        foreach (var line in lines.Take(1000)) // Limit for demo
        {
            var parts = line.Split(',');
            if (parts.Length > 1)
            {
                indicators.Add(new OSINTIndicator
                {
                    Id = Guid.NewGuid().ToString(),
                    FeedId = feed.Id,
                    Type = "url",
                    Value = parts[0].Trim('"'),
                    FirstSeen = DateTime.UtcNow,
                    LastSeen = DateTime.UtcNow,
                    Severity = "medium",
                    Confidence = 75
                });
            }
        }

        return indicators;
    }

    private List<OSINTIndicator> ParseJson(string content, OSINTFeed feed)
    {
        // Simplified JSON parser
        return new List<OSINTIndicator>();
    }
}

public interface ICanaryTokenService
{
    Task<string> CreateTokenAsync(string type, string name, string createdById);
    Task RecordTriggerAsync(string tokenId, string? sourceIp, string? userAgent);
}

public class CanaryTokenService : ICanaryTokenService
{
    private readonly SwordIntelDbContext _db;
    private readonly ILogger<CanaryTokenService> _logger;

    public CanaryTokenService(SwordIntelDbContext db, ILogger<CanaryTokenService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<string> CreateTokenAsync(string type, string name, string createdById)
    {
        var token = Guid.NewGuid().ToString("N");

        var canaryToken = new CanaryToken
        {
            Id = Guid.NewGuid().ToString(),
            Token = token,
            Type = type,
            Name = name,
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            TriggerCount = 0
        };

        _db.CanaryTokens.Add(canaryToken);
        await _db.SaveChangesAsync();

        return token;
    }

    public async Task RecordTriggerAsync(string tokenId, string? sourceIp, string? userAgent)
    {
        var trigger = new CanaryTrigger
        {
            Id = Guid.NewGuid().ToString(),
            TokenId = tokenId,
            TriggeredAt = DateTime.UtcNow,
            SourceIp = sourceIp,
            UserAgent = userAgent
        };

        _db.CanaryTriggers.Add(trigger);

        // Update token trigger count
        var token = await _db.CanaryTokens.FindAsync(tokenId);
        if (token != null)
        {
            var updatedToken = token with
            {
                TriggerCount = token.TriggerCount + 1,
                LastTriggeredAt = DateTime.UtcNow
            };
            _db.CanaryTokens.Update(updatedToken);
        }

        await _db.SaveChangesAsync();

        _logger.LogWarning("Canary token {TokenId} triggered from {IP}", tokenId, sourceIp);
    }
}
