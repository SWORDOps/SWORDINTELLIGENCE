using Fido2NetLib;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Serilog;
using StackExchange.Redis;
using SwordIntel.Infrastructure.Data;
using SwordIntel.Web.Hubs;
using SwordIntel.Web.Middleware;
using SwordIntel.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.PostgreSQL(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        "audit_logs",
        needAutoCreateTable: true)
    .CreateLogger();

builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<SwordIntelDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis for distributed caching and SignalR backplane
var redisConnection = ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!);
builder.Services.AddSingleton<IConnectionMultiplexer>(redisConnection);
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "SwordIntel:";
});

// FIDO2/WebAuthn
builder.Services.AddFido2(options =>
{
    options.ServerDomain = builder.Configuration["Fido2:ServerDomain"] ?? "localhost";
    options.ServerName = "SWORD Intelligence";
    options.Origins = builder.Configuration.GetSection("Fido2:Origins").Get<HashSet<string>>() ?? new HashSet<string> { "https://localhost" };
    options.TimestampDriftTolerance = builder.Configuration.GetValue<int>("Fido2:TimestampDriftTolerance");
});

// Authentication & Authorization
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
    };

    // Enable JWT in SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("admin"));
    options.AddPolicy("RequireMfa", policy => policy.RequireClaim("mfa_verified", "true"));
});

// SignalR with MessagePack and Redis backplane
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.MaximumReceiveMessageSize = 1024 * 1024; // 1MB
})
.AddMessagePackProtocol()
.AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!, options =>
{
    options.Configuration.ChannelPrefix = "SwordIntel:SignalR:";
});

// MVC + Razor Pages + Blazor hybrid
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Custom services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IVaultService, VaultService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IOSINTService, OSINTService>();
builder.Services.AddSingleton<ICanaryTokenService, CanaryTokenService>();

// Background services
builder.Services.AddHostedService<OSINTSyncService>();
builder.Services.AddHostedService<DeadDropMonitorService>();
builder.Services.AddHostedService<HeartbeatMonitorService>();

// HTTP Client for OSINT feeds
builder.Services.AddHttpClient("OSINTClient", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

var app = builder.Build();

// Esoteric middleware pipeline with custom ordering
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Custom security middleware
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ThreatDetectionMiddleware>();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Rate limiting middleware
app.UseMiddleware<RateLimitingMiddleware>();

// Map routes - esoteric hybrid routing
app.MapControllers(); // API controllers
app.MapRazorPages(); // Public pages
app.MapBlazorHub(); // Blazor Server
app.MapHub<SecureMessageHub>("/hubs/messages"); // SignalR
app.MapHub<IntelligenceFeedHub>("/hubs/intelligence");

// Fallback to Blazor for portal routes
app.MapFallbackToPage("/portal/{*path:nonfile}", "/_Host");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SwordIntelDbContext>();
    if (app.Environment.IsDevelopment())
    {
        await db.Database.EnsureCreatedAsync();
    }
}

app.Run();
