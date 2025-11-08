using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Diagnostics;

namespace SwordIntel.Web.Pages;

public class ErrorModel : PageModel
{
    public string? RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

    private readonly ILogger<ErrorModel> _logger;

    public ErrorModel(ILogger<ErrorModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
        _logger.LogError("Error page displayed for request {RequestId}", RequestId);
    }
}
