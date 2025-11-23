#!/bin/bash
#
# SWORD Intelligence - ASP.NET Core Deployment Script
# Deploys ASP.NET Core platform with Caddy reverse proxy
# Can be run from anywhere on a server
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Banner
show_banner() {
    clear
    cat << "EOF"
┌─────────────────────────────────────────────────────────────────┐
│   ███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗                   │
│   ██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗                  │
│   ███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║                  │
│   ╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║                  │
│   ███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝                  │
│   ╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝                   │
│                                                                 │
│   ASP.NET Core Platform - Production Deployment                │
│   Post-Quantum Intelligence Platform                           │
└─────────────────────────────────────────────────────────────────┘

EOF
}

# Check for required commands
check_dependencies() {
    local missing_deps=()

    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        missing_deps+=("docker-compose")
    fi

    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi

    # Check for dialog or whiptail
    if ! command -v dialog &> /dev/null && ! command -v whiptail &> /dev/null; then
        missing_deps+=("dialog or whiptail")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}Missing required dependencies:${NC}"
        printf '%s\n' "${missing_deps[@]}"
        echo ""
        echo "Install with:"
        echo "  Ubuntu/Debian: sudo apt-get install docker.io docker-compose git dialog"
        echo "  CentOS/RHEL:   sudo yum install docker docker-compose git dialog"
        exit 1
    fi
}

# Determine which dialog tool to use
get_dialog_cmd() {
    if command -v dialog &> /dev/null; then
        echo "dialog"
    else
        echo "whiptail"
    fi
}

# TUI Functions
show_menu() {
    local DIALOG_CMD=$(get_dialog_cmd)

    $DIALOG_CMD --title "SWORD Intelligence - ASP.NET Deployment" \
        --menu "Choose deployment configuration:" 20 70 10 \
        1 "Development (Local, no SSL)" \
        2 "Production (Domain + SSL via Caddy)" \
        3 "Production + Admin Tools (pgAdmin, Redis Commander)" \
        4 "Custom Configuration" \
        5 "Exit" 2>&1 >/dev/tty
}

get_input() {
    local DIALOG_CMD=$(get_dialog_cmd)
    local prompt="$1"
    local default="$2"

    $DIALOG_CMD --title "Configuration" \
        --inputbox "$prompt" 10 60 "$default" 2>&1 >/dev/tty
}

get_yes_no() {
    local DIALOG_CMD=$(get_dialog_cmd)
    local prompt="$1"

    $DIALOG_CMD --title "Confirmation" \
        --yesno "$prompt" 10 60 2>&1 >/dev/tty
    echo $?
}

show_message() {
    local DIALOG_CMD=$(get_dialog_cmd)
    local title="$1"
    local message="$2"

    $DIALOG_CMD --title "$title" \
        --msgbox "$message" 15 70 2>&1 >/dev/tty
}

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/opt/swordintel-aspnet}"
REPO_URL="https://github.com/SWORDOps/SWORDINTELLIGENCE.git"
BRANCH="${BRANCH:-main}"

# Get configuration from user
configure_deployment() {
    show_banner

    local choice=$(show_menu)

    case $choice in
        1)
            DEPLOYMENT_MODE="development"
            USE_CADDY="false"
            USE_ADMIN_TOOLS="false"
            DOMAIN="localhost"
            ;;
        2)
            DEPLOYMENT_MODE="production"
            USE_CADDY="true"
            USE_ADMIN_TOOLS="false"
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")
            EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            ;;
        3)
            DEPLOYMENT_MODE="production"
            USE_CADDY="true"
            USE_ADMIN_TOOLS="true"
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")
            EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            ADMIN_DOMAIN=$(get_input "Enter admin subdomain (for pgAdmin/Redis):" "admin.swordintel.example.com")
            ;;
        4)
            DEPLOYMENT_MODE=$(get_input "Deployment mode (development/production):" "production")
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")

            if [ $(get_yes_no "Enable Caddy reverse proxy with SSL?") -eq 0 ]; then
                USE_CADDY="true"
                EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            else
                USE_CADDY="false"
            fi

            if [ $(get_yes_no "Include admin tools (pgAdmin, Redis Commander)?") -eq 0 ]; then
                USE_ADMIN_TOOLS="true"
                ADMIN_DOMAIN=$(get_input "Enter admin subdomain:" "admin.${DOMAIN}")
            else
                USE_ADMIN_TOOLS="false"
            fi
            ;;
        5|*)
            echo "Exiting..."
            exit 0
            ;;
    esac

    # Get optional configurations
    DB_PASSWORD=$(get_input "PostgreSQL password:" "SwordIntel2024!SecurePass")
    JWT_SECRET=$(get_input "JWT secret (leave empty to generate):" "")

    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    fi
}

# Clone or update repository
setup_repository() {
    echo -e "${CYAN}Setting up repository...${NC}"

    if [ -d "$DEPLOY_DIR" ]; then
        if [ $(get_yes_no "Directory $DEPLOY_DIR exists. Update existing deployment?") -eq 0 ]; then
            cd "$DEPLOY_DIR"
            git fetch origin
            git checkout "$BRANCH"
            git pull origin "$BRANCH"
        else
            echo -e "${RED}Deployment cancelled.${NC}"
            exit 1
        fi
    else
        sudo mkdir -p "$DEPLOY_DIR"
        sudo chown $USER:$USER "$DEPLOY_DIR"
        git clone -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
}

# Generate Caddy configuration
generate_caddyfile() {
    if [ "$USE_CADDY" != "true" ]; then
        return
    fi

    echo -e "${CYAN}Generating Caddyfile...${NC}"

    cat > "$DEPLOY_DIR/Caddyfile.aspnet" << EOF
# SWORD Intelligence - ASP.NET Core
# Auto-generated Caddyfile

$DOMAIN {
    # Automatic HTTPS via Let's Encrypt
    tls $EMAIL

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "geolocation=(), microphone=(), camera=()"
        -Server
    }

    # Reverse proxy to ASP.NET Core
    reverse_proxy web:5000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-Host {host}
    }

    # Enable compression
    encode gzip zstd

    # Logging
    log {
        output file /var/log/caddy/access.log
        format json
    }
}

EOF

    # Add admin tools subdomain if enabled
    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        cat >> "$DEPLOY_DIR/Caddyfile.aspnet" << EOF
# Admin Tools
$ADMIN_DOMAIN {
    tls $EMAIL

    # Basic auth for admin tools (change password!)
    basicauth {
        admin \$2a\$14\$Zkx19XLiW6VYouLHR5NmfOFU0z2GTNmpkT/5qqR7hx7wNQXlqE6jm
    }

    # pgAdmin
    route /pgadmin* {
        reverse_proxy pgadmin:80
    }

    # Redis Commander
    route /redis* {
        reverse_proxy redis-commander:8081
    }

    # Default to pgAdmin
    redir / /pgadmin

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }

    encode gzip zstd

    log {
        output file /var/log/caddy/admin-access.log
        format json
    }
}

EOF
    fi
}

# Generate production docker-compose
generate_docker_compose() {
    echo -e "${CYAN}Generating docker-compose.prod.yml...${NC}"

    cd "$DEPLOY_DIR/src"

    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: swordintel-aspnet-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: swordintel
      POSTGRES_USER: swordintel
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - swordintel-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U swordintel"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: swordintel-aspnet-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${DB_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - swordintel-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: swordintel-aspnet-web
    restart: unless-stopped
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=swordintel;Username=swordintel;Password=${DB_PASSWORD}
      - ConnectionStrings__Redis=redis:6379,password=${DB_PASSWORD}
      - Jwt__Secret=${JWT_SECRET}
      - Jwt__Issuer=SwordIntelligence
      - Jwt__Audience=SwordIntelClients
      - Jwt__ExpirationHours=24
      - Fido2__ServerDomain=${DOMAIN}
      - Fido2__ServerName=SWORD Intelligence
      - Fido2__Origins__0=https://${DOMAIN}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - swordintel-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

EOF

    # Add Caddy if enabled
    if [ "$USE_CADDY" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  caddy:
    image: caddy:2-alpine
    container_name: swordintel-aspnet-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ../Caddyfile.aspnet:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
      - caddy_logs:/var/log/caddy
    networks:
      - swordintel-network
    depends_on:
      - web

EOF
    else
        cat >> docker-compose.prod.yml << EOF
    ports:
      - "5000:5000"

EOF
    fi

    # Add admin tools if enabled
    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: swordintel-aspnet-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@swordintel.local
      PGADMIN_DEFAULT_PASSWORD: ${DB_PASSWORD}
      PGADMIN_CONFIG_SERVER_MODE: 'True'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'True'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - swordintel-network
    depends_on:
      - postgres

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: swordintel-aspnet-redis-commander
    restart: unless-stopped
    environment:
      - REDIS_HOSTS=local:redis:6379:0:${DB_PASSWORD}
    networks:
      - swordintel-network
    depends_on:
      - redis

EOF
    fi

    # Add networks and volumes
    cat >> docker-compose.prod.yml << EOF
networks:
  swordintel-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
EOF

    if [ "$USE_CADDY" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  caddy_data:
  caddy_config:
  caddy_logs:
EOF
    fi

    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  pgadmin_data:
EOF
    fi
}

# Deploy
deploy() {
    echo -e "${CYAN}Starting deployment...${NC}"

    cd "$DEPLOY_DIR/src"

    # Build and start services
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker compose -f docker-compose.prod.yml build
        docker compose -f docker-compose.prod.yml up -d
    fi

    echo -e "${GREEN}Deployment complete!${NC}"
}

# Show deployment info
show_deployment_info() {
    local DIALOG_CMD=$(get_dialog_cmd)

    local info="Deployment Summary:\n\n"
    info+="Mode: $DEPLOYMENT_MODE\n"
    info+="Domain: $DOMAIN\n"
    info+="Caddy Reverse Proxy: $USE_CADDY\n"
    info+="Admin Tools: $USE_ADMIN_TOOLS\n\n"

    if [ "$USE_CADDY" = "true" ]; then
        info+="Main Site: https://$DOMAIN\n"
    else
        info+="Main Site: http://localhost:5000\n"
    fi

    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        info+="Admin Panel: https://$ADMIN_DOMAIN\n"
        info+="  Username: admin\n"
        info+="  Password: admin (CHANGE THIS!)\n\n"
    fi

    info+="Database:\n"
    info+="  Host: postgres\n"
    info+="  Database: swordintel\n"
    info+="  User: swordintel\n"
    info+="  Password: $DB_PASSWORD\n\n"

    info+="Directory: $DEPLOY_DIR\n\n"
    info+="View logs: docker logs swordintel-aspnet-web\n"
    info+="Stop: docker-compose -f docker-compose.prod.yml down\n"
    info+="Restart: docker-compose -f docker-compose.prod.yml restart\n"

    show_message "Deployment Complete" "$info"

    # Also print to console
    clear
    show_banner
    echo -e "${GREEN}=== Deployment Complete ===${NC}\n"
    echo -e "$info" | sed 's/\\n/\n/g'
}

# Main execution
main() {
    show_banner
    sleep 2

    check_dependencies
    configure_deployment
    setup_repository
    generate_caddyfile
    generate_docker_compose
    deploy
    show_deployment_info
}

main "$@"
