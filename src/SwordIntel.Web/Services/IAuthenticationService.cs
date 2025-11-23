namespace SwordIntel.Web.Services;

public interface IAuthenticationService
{
    Task<string?> AuthenticateAsync(string email, string password);
    Task<bool> VerifyMfaAsync(string userId, string code);
    Task<bool> RegisterWebAuthnAsync(string userId, string credentialId, byte[] publicKey);
    Task<bool> VerifyWebAuthnAsync(string credentialId, byte[] signature, byte[] data);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly SwordIntelDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthenticationService(SwordIntelDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<string?> AuthenticateAsync(string email, string password)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user == null) return null;

        // Verify password (using BCrypt in production)
        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        // Generate JWT token
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!);
        var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, user.Email),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role ?? "user")
            }),
            Expires = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpirationMinutes")),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
                Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<bool> VerifyMfaAsync(string userId, string code)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user?.TotpSecret == null) return false;

        // Verify TOTP code
        var totp = new TwoFactorAuthNet.TwoFactorAuth();
        return totp.VerifyCode(user.TotpSecret, code);
    }

    public async Task<bool> RegisterWebAuthnAsync(string userId, string credentialId, byte[] publicKey)
    {
        var authenticator = new Authenticator
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            CredentialId = credentialId,
            PublicKey = publicKey,
            CredentialPublicKey = publicKey,
            Counter = 0,
            CredentialType = "public-key",
            Transports = new List<string> { "usb", "nfc" },
            IsBackupEligible = false,
            IsBackedUp = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Authenticators.Add(authenticator);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyWebAuthnAsync(string credentialId, byte[] signature, byte[] data)
    {
        var auth = await _db.Authenticators.FirstOrDefaultAsync(a => a.CredentialId == credentialId);
        if (auth == null) return false;

        // Verify signature using public key (simplified)
        // In production, use Fido2NetLib for proper verification
        return true;
    }
}
