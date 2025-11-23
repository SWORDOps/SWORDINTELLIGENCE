namespace SwordIntel.Web.Services;

/// <summary>
/// Background service to sync OSINT feeds periodically
/// </summary>
public class OSINTSyncService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OSINTSyncService> _logger;
    private readonly TimeSpan _interval;

    public OSINTSyncService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<OSINTSyncService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _interval = TimeSpan.FromMinutes(configuration.GetValue<int>("OSINT:SyncIntervalMinutes", 60));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OSINT Sync Service starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var osintService = scope.ServiceProvider.GetRequiredService<IOSINTService>();

                _logger.LogInformation("Starting OSINT feed sync");
                await osintService.SyncFeedsAsync();
                _logger.LogInformation("OSINT feed sync completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during OSINT feed sync");
            }

            await Task.Delay(_interval, stoppingToken);
        }
    }
}

/// <summary>
/// Monitor dead drops and trigger delivery based on conditions
/// </summary>
public class DeadDropMonitorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeadDropMonitorService> _logger;

    public DeadDropMonitorService(IServiceProvider serviceProvider, ILogger<DeadDropMonitorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Dead Drop Monitor Service starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<SwordIntelDbContext>();

                // Check time-based triggers
                var timeBasedDrops = await db.DeadDrops
                    .Where(d => d.Status == "pending" &&
                                d.TriggerType == "time" &&
                                d.TriggerTime <= DateTime.UtcNow)
                    .ToListAsync(stoppingToken);

                foreach (var drop in timeBasedDrops)
                {
                    await TriggerDeadDropAsync(db, drop);
                }

                // Check heartbeat-based triggers
                await CheckHeartbeatTriggersAsync(db, stoppingToken);

                await db.SaveChangesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Dead Drop Monitor");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task TriggerDeadDropAsync(SwordIntelDbContext db, DeadDrop drop)
    {
        var updatedDrop = drop with
        {
            Status = "delivered",
            DeliveredAt = DateTime.UtcNow
        };

        db.DeadDrops.Update(updatedDrop);

        _logger.LogInformation("Dead drop {DropId} triggered", drop.Id);

        // In production, send notification to recipients
    }

    private async Task CheckHeartbeatTriggersAsync(SwordIntelDbContext db, CancellationToken stoppingToken)
    {
        var heartbeatDrops = await db.DeadDrops
            .Where(d => d.Status == "pending" && d.TriggerType == "heartbeat")
            .ToListAsync(stoppingToken);

        foreach (var drop in heartbeatDrops)
        {
            if (drop.HeartbeatIntervalMinutes == null || drop.HeartbeatMissedCount == null)
                continue;

            var lastHeartbeat = await db.Heartbeats
                .Where(h => h.UserId == drop.CreatedById)
                .OrderByDescending(h => h.Timestamp)
                .FirstOrDefaultAsync(stoppingToken);

            if (lastHeartbeat != null)
            {
                var timeSinceHeartbeat = DateTime.UtcNow - lastHeartbeat.Timestamp;
                var missedCount = (int)(timeSinceHeartbeat.TotalMinutes / drop.HeartbeatIntervalMinutes.Value);

                if (missedCount >= drop.HeartbeatMissedCount.Value)
                {
                    await TriggerDeadDropAsync(db, drop);
                }
            }
        }
    }
}

/// <summary>
/// Monitor heartbeat signals and clean up old data
/// </summary>
public class HeartbeatMonitorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HeartbeatMonitorService> _logger;

    public HeartbeatMonitorService(IServiceProvider serviceProvider, ILogger<HeartbeatMonitorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Heartbeat Monitor Service starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<SwordIntelDbContext>();

                // Clean up old heartbeats (older than 30 days)
                var cutoff = DateTime.UtcNow.AddDays(-30);
                var oldHeartbeats = await db.Heartbeats
                    .Where(h => h.Timestamp < cutoff)
                    .ToListAsync(stoppingToken);

                if (oldHeartbeats.Any())
                {
                    db.Heartbeats.RemoveRange(oldHeartbeats);
                    await db.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Cleaned up {Count} old heartbeats", oldHeartbeats.Count);
                }

                // Clean up old location data
                var oldLocations = await db.UserLocations
                    .Where(l => l.Timestamp < cutoff)
                    .ToListAsync(stoppingToken);

                if (oldLocations.Any())
                {
                    db.UserLocations.RemoveRange(oldLocations);
                    await db.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Cleaned up {Count} old locations", oldLocations.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Heartbeat Monitor");
            }

            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
        }
    }
}
