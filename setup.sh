#!/bin/bash

# SWORD Intelligence - Setup Script
# Retro 90s MilSpec Setup Experience

set -e

# Colors (terminal green theme)
GREEN='\033[0;32m'
BRIGHT_GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${BRIGHT_GREEN}"
cat << "EOF"
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
EOF
echo -e "${NC}"

echo -e "${GREEN}[STATUS: INITIATING SETUP SEQUENCE]${NC}\n"

# Check prerequisites
echo -e "${YELLOW}▸ Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker detected${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker Compose detected${NC}"

# Check .NET SDK (optional for local development)
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    echo -e "${GREEN}  ✓ .NET SDK ${DOTNET_VERSION} detected${NC}"
else
    echo -e "${YELLOW}  ⚠ .NET SDK not found (required for local development)${NC}"
fi

echo ""

# Setup options
echo -e "${BRIGHT_GREEN}[DEPLOYMENT OPTIONS]${NC}"
echo "1. Infrastructure Only (PostgreSQL + Redis)"
echo "2. Full Stack (Infrastructure + ASP.NET Web)"
echo "3. With Admin Tools (Infrastructure + pgAdmin + Redis Commander)"
echo "4. Everything (Full Stack + Admin Tools)"
echo ""
read -p "$(echo -e ${YELLOW}▸ Select option [1-4]:${NC} )" OPTION

echo ""

case $OPTION in
    1)
        echo -e "${GREEN}[LAUNCHING INFRASTRUCTURE]${NC}"
        docker-compose up -d postgres redis
        ;;
    2)
        echo -e "${GREEN}[LAUNCHING FULL STACK]${NC}"
        docker-compose --profile full up -d
        ;;
    3)
        echo -e "${GREEN}[LAUNCHING WITH ADMIN TOOLS]${NC}"
        docker-compose --profile tools up -d
        ;;
    4)
        echo -e "${GREEN}[LAUNCHING EVERYTHING]${NC}"
        docker-compose --profile full --profile tools up -d
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BRIGHT_GREEN}[WAITING FOR SERVICES]${NC}"

# Wait for PostgreSQL
echo -e "${YELLOW}▸ Waiting for PostgreSQL...${NC}"
until docker exec swordintel-postgres pg_isready -U swordintel &> /dev/null; do
    echo -e "${YELLOW}  ⟳ PostgreSQL initializing...${NC}"
    sleep 2
done
echo -e "${GREEN}  ✓ PostgreSQL ready${NC}"

# Wait for Redis
echo -e "${YELLOW}▸ Waiting for Redis...${NC}"
until docker exec swordintel-redis redis-cli ping &> /dev/null; do
    echo -e "${YELLOW}  ⟳ Redis initializing...${NC}"
    sleep 2
done
echo -e "${GREEN}  ✓ Redis ready${NC}"

echo ""
echo -e "${BRIGHT_GREEN}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BRIGHT_GREEN}│  [DEPLOYMENT COMPLETE - SYSTEMS OPERATIONAL]                │${NC}"
echo -e "${BRIGHT_GREEN}└─────────────────────────────────────────────────────────────┘${NC}"
echo ""

# Display connection information
echo -e "${GREEN}[CONNECTION ENDPOINTS]${NC}"
echo -e "${YELLOW}▸ PostgreSQL:${NC}"
echo "  Host: localhost:5432"
echo "  Database: swordintel"
echo "  Username: swordintel"
echo "  Password: SwordIntel2024!SecurePass"
echo ""

echo -e "${YELLOW}▸ Redis:${NC}"
echo "  Host: localhost:6379"
echo ""

if [[ $OPTION == "3" ]] || [[ $OPTION == "4" ]]; then
    echo -e "${YELLOW}▸ pgAdmin:${NC}"
    echo "  URL: http://localhost:5050"
    echo "  Email: admin@swordintel.local"
    echo "  Password: admin"
    echo ""

    echo -e "${YELLOW}▸ Redis Commander:${NC}"
    echo "  URL: http://localhost:8081"
    echo ""
fi

if [[ $OPTION == "2" ]] || [[ $OPTION == "4" ]]; then
    echo -e "${YELLOW}▸ SWORD Intelligence Web:${NC}"
    echo "  URL: http://localhost:8080"
    echo "  HTTPS: https://localhost:8443"
    echo ""
else
    echo -e "${BRIGHT_GREEN}[LOCAL DEVELOPMENT MODE]${NC}"
    echo "To run ASP.NET locally:"
    echo "  cd src/SwordIntel.Web"
    echo "  dotnet restore"
    echo "  dotnet run"
    echo ""
fi

echo -e "${GREEN}[TACTICAL STATUS]${NC}"
echo "View logs:     docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "Destroy data:  docker-compose down -v"
echo ""

echo -e "${BRIGHT_GREEN}█ MISSION READY █${NC}"
