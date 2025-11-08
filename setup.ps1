# SWORD Intelligence - Setup Script (PowerShell)
# Retro 90s MilSpec Setup Experience for Windows

$ErrorActionPreference = "Stop"

# Colors
$Green = "Green"
$BrightGreen = "Cyan"
$Yellow = "Yellow"
$Red = "Red"

# ASCII Art Banner
Write-Host @"
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗                   │
│   ██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗                  │
│   ███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║                  │
│   ╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║                  │
│   ███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝                  │
│   ╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝                   │
│                                                                 │
│   INTELLIGENCE PLATFORM - ASP.NET CORE 8.0                      │
│   [ CLASSIFIED - AUTHORIZED PERSONNEL ONLY ]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
"@ -ForegroundColor $BrightGreen

Write-Host "`n[STATUS: INITIATING SETUP SEQUENCE]`n" -ForegroundColor $Green

# Check prerequisites
Write-Host "▸ Checking prerequisites..." -ForegroundColor $Yellow

# Check Docker
try {
    $null = docker --version
    Write-Host "  ✓ Docker detected" -ForegroundColor $Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop first." -ForegroundColor $Red
    exit 1
}

# Check Docker Compose
try {
    $null = docker-compose --version
    Write-Host "  ✓ Docker Compose detected" -ForegroundColor $Green
} catch {
    try {
        $null = docker compose version
        Write-Host "  ✓ Docker Compose detected" -ForegroundColor $Green
    } catch {
        Write-Host "✗ Docker Compose not found. Please install Docker Compose first." -ForegroundColor $Red
        exit 1
    }
}

# Check .NET SDK
try {
    $dotnetVersion = dotnet --version
    Write-Host "  ✓ .NET SDK $dotnetVersion detected" -ForegroundColor $Green
} catch {
    Write-Host "  ⚠ .NET SDK not found (required for local development)" -ForegroundColor $Yellow
}

Write-Host ""

# Setup options
Write-Host "[DEPLOYMENT OPTIONS]" -ForegroundColor $BrightGreen
Write-Host "1. Infrastructure Only (PostgreSQL + Redis)"
Write-Host "2. Full Stack (Infrastructure + ASP.NET Web)"
Write-Host "3. With Admin Tools (Infrastructure + pgAdmin + Redis Commander)"
Write-Host "4. Everything (Full Stack + Admin Tools)"
Write-Host ""
$option = Read-Host "▸ Select option [1-4]"

Write-Host ""

switch ($option) {
    "1" {
        Write-Host "[LAUNCHING INFRASTRUCTURE]" -ForegroundColor $Green
        docker-compose up -d postgres redis
    }
    "2" {
        Write-Host "[LAUNCHING FULL STACK]" -ForegroundColor $Green
        docker-compose --profile full up -d
    }
    "3" {
        Write-Host "[LAUNCHING WITH ADMIN TOOLS]" -ForegroundColor $Green
        docker-compose --profile tools up -d
    }
    "4" {
        Write-Host "[LAUNCHING EVERYTHING]" -ForegroundColor $Green
        docker-compose --profile full --profile tools up -d
    }
    default {
        Write-Host "Invalid option" -ForegroundColor $Red
        exit 1
    }
}

Write-Host "`n[WAITING FOR SERVICES]" -ForegroundColor $BrightGreen

# Wait for PostgreSQL
Write-Host "▸ Waiting for PostgreSQL..." -ForegroundColor $Yellow
do {
    Write-Host "  ⟳ PostgreSQL initializing..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 2
    $pgReady = docker exec swordintel-postgres pg_isready -U swordintel 2>$null
} while ($LASTEXITCODE -ne 0)
Write-Host "  ✓ PostgreSQL ready" -ForegroundColor $Green

# Wait for Redis
Write-Host "▸ Waiting for Redis..." -ForegroundColor $Yellow
do {
    Write-Host "  ⟳ Redis initializing..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 2
    $redisReady = docker exec swordintel-redis redis-cli ping 2>$null
} while ($LASTEXITCODE -ne 0)
Write-Host "  ✓ Redis ready" -ForegroundColor $Green

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────────┐" -ForegroundColor $BrightGreen
Write-Host "│  [DEPLOYMENT COMPLETE - SYSTEMS OPERATIONAL]                │" -ForegroundColor $BrightGreen
Write-Host "└─────────────────────────────────────────────────────────────┘" -ForegroundColor $BrightGreen
Write-Host ""

# Display connection information
Write-Host "[CONNECTION ENDPOINTS]" -ForegroundColor $Green
Write-Host "▸ PostgreSQL:" -ForegroundColor $Yellow
Write-Host "  Host: localhost:5432"
Write-Host "  Database: swordintel"
Write-Host "  Username: swordintel"
Write-Host "  Password: SwordIntel2024!SecurePass"
Write-Host ""

Write-Host "▸ Redis:" -ForegroundColor $Yellow
Write-Host "  Host: localhost:6379"
Write-Host ""

if ($option -eq "3" -or $option -eq "4") {
    Write-Host "▸ pgAdmin:" -ForegroundColor $Yellow
    Write-Host "  URL: http://localhost:5050"
    Write-Host "  Email: admin@swordintel.local"
    Write-Host "  Password: admin"
    Write-Host ""

    Write-Host "▸ Redis Commander:" -ForegroundColor $Yellow
    Write-Host "  URL: http://localhost:8081"
    Write-Host ""
}

if ($option -eq "2" -or $option -eq "4") {
    Write-Host "▸ SWORD Intelligence Web:" -ForegroundColor $Yellow
    Write-Host "  URL: http://localhost:8080"
    Write-Host "  HTTPS: https://localhost:8443"
    Write-Host ""
} else {
    Write-Host "[LOCAL DEVELOPMENT MODE]" -ForegroundColor $BrightGreen
    Write-Host "To run ASP.NET locally:"
    Write-Host "  cd src\SwordIntel.Web"
    Write-Host "  dotnet restore"
    Write-Host "  dotnet run"
    Write-Host ""
}

Write-Host "[TACTICAL STATUS]" -ForegroundColor $Green
Write-Host "View logs:     docker-compose logs -f"
Write-Host "Stop services: docker-compose down"
Write-Host "Destroy data:  docker-compose down -v"
Write-Host ""

Write-Host "█ MISSION READY █" -ForegroundColor $BrightGreen
