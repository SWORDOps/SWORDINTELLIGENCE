namespace SwordIntel.Web.Middleware;

/// <summary>
/// Middleware to add security headers (CSP, HSTS, etc.)
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _nonce;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
        _nonce = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Generate nonce for this request
        var nonce = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16));
        context.Items["csp-nonce"] = nonce;

        // Content Security Policy
        context.Response.Headers.Append("Content-Security-Policy",
            $"default-src 'self'; " +
            $"script-src 'self' 'nonce-{nonce}' 'strict-dynamic'; " +
            $"style-src 'self' 'unsafe-inline'; " +
            $"img-src 'self' data: blob:; " +
            $"font-src 'self' data:; " +
            $"connect-src 'self' wss: ws:; " +
            $"frame-ancestors 'none'; " +
            $"base-uri 'self'; " +
            $"form-action 'self'");

        // HSTS - 2 years
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

        // Additional security headers
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Append("Permissions-Policy", "geolocation=(self), microphone=(), camera=()");
        context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "require-corp");
        context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin");
        context.Response.Headers.Append("Cross-Origin-Resource-Policy", "same-origin");

        await _next(context);
    }
}

/// <summary>
/// Request logging middleware with audit trail
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;

        // Log request
        _logger.LogInformation(
            "Request: {Method} {Path} from {IP}",
            context.Request.Method,
            context.Request.Path,
            context.Connection.RemoteIpAddress);

        await _next(context);

        // Log response
        var duration = DateTime.UtcNow - startTime;
        _logger.LogInformation(
            "Response: {StatusCode} in {Duration}ms",
            context.Response.StatusCode,
            duration.TotalMilliseconds);
    }
}

/// <summary>
/// Threat detection middleware - pattern matching for attacks
/// </summary>
public class ThreatDetectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ThreatDetectionMiddleware> _logger;

    private static readonly string[] SuspiciousPatterns = new[]
    {
        "../", "..\\", "<script", "javascript:", "onerror=", "onload=",
        "' OR '1'='1", "UNION SELECT", "DROP TABLE", "'; --",
        "cmd.exe", "/etc/passwd", "file://", "gopher://"
    };

    public ThreatDetectionMiddleware(RequestDelegate next, ILogger<ThreatDetectionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var queryString = context.Request.QueryString.Value ?? string.Empty;

        // Check for suspicious patterns
        foreach (var pattern in SuspiciousPatterns)
        {
            if (path.Contains(pattern, StringComparison.OrdinalIgnoreCase) ||
                queryString.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Suspicious request detected: {Pattern} in {Path} from {IP}",
                    pattern,
                    path,
                    context.Connection.RemoteIpAddress);

                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("Bad Request");
                return;
            }
        }

        await _next(context);
    }
}

/// <summary>
/// Rate limiting middleware using distributed cache
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IDistributedCache _cache;
    private readonly IConfiguration _configuration;

    public RateLimitingMiddleware(
        RequestDelegate next,
        IDistributedCache cache,
        IConfiguration configuration)
    {
        _next = next;
        _cache = cache;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var key = $"ratelimit:{ipAddress}";

        var currentCount = await _cache.GetStringAsync(key);
        var count = currentCount != null ? int.Parse(currentCount) : 0;

        var permitLimit = _configuration.GetValue<int>("RateLimit:PermitLimit", 100);

        if (count >= permitLimit)
        {
            context.Response.StatusCode = 429;
            context.Response.Headers.Append("Retry-After", "60");
            await context.Response.WriteAsync("Rate limit exceeded");
            return;
        }

        await _cache.SetStringAsync(key, (count + 1).ToString(), new Microsoft.Extensions.Caching.Distributed.DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
        });

        await _next(context);
    }
}
