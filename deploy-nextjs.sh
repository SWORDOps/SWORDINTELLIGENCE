#!/bin/bash
#
# SWORD Intelligence - Next.js Deployment Script
# Deploys Next.js platform with Caddy reverse proxy
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
│   Next.js Platform - Production Deployment                     │
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

    $DIALOG_CMD --title "SWORD Intelligence - Next.js Deployment" \
        --menu "Choose deployment configuration:" 20 70 10 \
        1 "Development (Local, no SSL)" \
        2 "Production (Domain + SSL via Caddy)" \
        3 "Production + OSINT Worker" \
        4 "Full Stack (Everything + Admin Tools)" \
        5 "Custom Configuration" \
        6 "Exit" 2>&1 >/dev/tty
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
        --msgbox "$message" 20 70 2>&1 >/dev/tty
}

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/opt/swordintel-nextjs}"
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
            USE_OSINT_WORKER="false"
            USE_ADMIN_TOOLS="false"
            DOMAIN="localhost"
            ;;
        2)
            DEPLOYMENT_MODE="production"
            USE_CADDY="true"
            USE_OSINT_WORKER="false"
            USE_ADMIN_TOOLS="false"
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")
            EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            ;;
        3)
            DEPLOYMENT_MODE="production"
            USE_CADDY="true"
            USE_OSINT_WORKER="true"
            USE_ADMIN_TOOLS="false"
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")
            EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            ;;
        4)
            DEPLOYMENT_MODE="production"
            USE_CADDY="true"
            USE_OSINT_WORKER="true"
            USE_ADMIN_TOOLS="true"
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")
            EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            ADMIN_DOMAIN=$(get_input "Enter admin subdomain:" "admin.swordintel.example.com")
            ;;
        5)
            DEPLOYMENT_MODE=$(get_input "Deployment mode (development/production):" "production")
            DOMAIN=$(get_input "Enter your domain name:" "swordintel.example.com")

            if [ $(get_yes_no "Enable Caddy reverse proxy with SSL?") -eq 0 ]; then
                USE_CADDY="true"
                EMAIL=$(get_input "Enter email for Let's Encrypt SSL:" "admin@example.com")
            else
                USE_CADDY="false"
            fi

            if [ $(get_yes_no "Enable OSINT background worker?") -eq 0 ]; then
                USE_OSINT_WORKER="true"
            else
                USE_OSINT_WORKER="false"
            fi

            if [ $(get_yes_no "Include admin tools (Prisma Studio)?") -eq 0 ]; then
                USE_ADMIN_TOOLS="true"
                ADMIN_DOMAIN=$(get_input "Enter admin subdomain:" "admin.${DOMAIN}")
            else
                USE_ADMIN_TOOLS="false"
            fi
            ;;
        6|*)
            echo "Exiting..."
            exit 0
            ;;
    esac

    # Get optional configurations
    DB_PASSWORD=$(get_input "PostgreSQL password:" "SwordIntel2024!SecurePass")
    NEXTAUTH_SECRET=$(get_input "NextAuth secret (leave empty to generate):" "")

    if [ -z "$NEXTAUTH_SECRET" ]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    fi

    # Optional API keys
    if [ $(get_yes_no "Configure OSINT API keys (OTX, VirusTotal)?") -eq 0 ]; then
        OTX_API_KEY=$(get_input "AlienVault OTX API Key (optional):" "")
        VIRUSTOTAL_API_KEY=$(get_input "VirusTotal API Key (optional):" "")
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

    cat > "$DEPLOY_DIR/Caddyfile.nextjs" << EOF
# SWORD Intelligence - Next.js Platform
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

    # WebSocket support for real-time messaging
    @websockets {
        header Connection *Upgrade*
        header Upgrade websocket
    }

    # Reverse proxy to Next.js
    reverse_proxy app:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-Host {host}
    }

    # WebSocket proxy to WebSocket server
    reverse_proxy @websockets websocket:8080 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
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
        cat >> "$DEPLOY_DIR/Caddyfile.nextjs" << EOF
# Admin Tools
$ADMIN_DOMAIN {
    tls $EMAIL

    # Basic auth for admin tools (change password!)
    basicauth {
        admin \$2a\$14\$Zkx19XLiW6VYouLHR5NmfOFU0z2GTNmpkT/5qqR7hx7wNQXlqE6jm
    }

    # Prisma Studio
    reverse_proxy studio:5555

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

# Generate .env file
generate_env_file() {
    echo -e "${CYAN}Generating .env file...${NC}"

    cat > "$DEPLOY_DIR/.env.production" << EOF
# SWORD Intelligence - Production Environment
# Auto-generated configuration

# Database
DATABASE_URL=postgresql://swordintel:${DB_PASSWORD}@db:5432/sword_intel

# Redis
REDIS_URL=redis://redis:6379

# WebSocket
WS_PORT=8080
WS_HOST=0.0.0.0
NEXT_PUBLIC_WS_URL=wss://${DOMAIN}/ws

# NextAuth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# WebAuthn / Hardware Authentication
WEBAUTHN_RP_NAME="SWORD Intelligence"
WEBAUTHN_RP_ID=${DOMAIN}
WEBAUTHN_ORIGIN=https://${DOMAIN}

# OSINT Feed API Keys (optional)
EOF

    if [ -n "$OTX_API_KEY" ]; then
        echo "OTX_API_KEY=${OTX_API_KEY}" >> "$DEPLOY_DIR/.env.production"
    fi

    if [ -n "$VIRUSTOTAL_API_KEY" ]; then
        echo "VIRUSTOTAL_API_KEY=${VIRUSTOTAL_API_KEY}" >> "$DEPLOY_DIR/.env.production"
    fi

    cat >> "$DEPLOY_DIR/.env.production" << EOF

# Security
AUDIT_LOG_RETENTION_DAYS=2555
SESSION_TIMEOUT_HOURS=24

# Node Environment
NODE_ENV=production
EOF
}

# Generate production docker-compose
generate_docker_compose() {
    echo -e "${CYAN}Generating docker-compose.prod.yml...${NC}"

    cd "$DEPLOY_DIR"

    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: swordintel-nextjs-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: sword_intel
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
    container_name: swordintel-nextjs-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - swordintel-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile.nextjs
    container_name: swordintel-nextjs-app
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - swordintel-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  websocket:
    build:
      context: .
      dockerfile: Dockerfile.websocket
    container_name: swordintel-nextjs-websocket
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - swordintel-network

EOF

    # Add OSINT worker if enabled
    if [ "$USE_OSINT_WORKER" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  osint-worker:
    build:
      context: .
      dockerfile: Dockerfile.osint
    container_name: swordintel-nextjs-osint
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - swordintel-network

EOF
    fi

    # Add Caddy if enabled
    if [ "$USE_CADDY" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  caddy:
    image: caddy:2-alpine
    container_name: swordintel-nextjs-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./Caddyfile.nextjs:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
      - caddy_logs:/var/log/caddy
    networks:
      - swordintel-network
    depends_on:
      - app
      - websocket

EOF
    else
        # Expose ports directly if no Caddy
        sed -i '/healthcheck:/i\    ports:\n      - "3000:3000"' docker-compose.prod.yml
        cat >> docker-compose.prod.yml << EOF
    ports:
      - "8080:8080"

EOF
    fi

    # Add admin tools if enabled
    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        cat >> docker-compose.prod.yml << EOF
  studio:
    build:
      context: .
      dockerfile: Dockerfile.studio
    container_name: swordintel-nextjs-studio
    restart: unless-stopped
    env_file:
      - .env.production
    networks:
      - swordintel-network
    depends_on:
      - db

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
}

# Generate Dockerfiles
generate_dockerfiles() {
    echo -e "${CYAN}Generating Dockerfiles...${NC}"

    cd "$DEPLOY_DIR"

    # Next.js app Dockerfile
    cat > Dockerfile.nextjs << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
EOF

    # WebSocket server Dockerfile
    cat > Dockerfile.websocket << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server ./server
COPY lib ./lib
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 8080
CMD ["node", "server/websocket.ts"]
EOF

    # OSINT worker Dockerfile
    cat > Dockerfile.osint << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY scripts ./scripts
COPY lib ./lib
COPY prisma ./prisma
RUN npx prisma generate
CMD ["npm", "run", "osint:sync"]
EOF

    # Prisma Studio Dockerfile
    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        cat > Dockerfile.studio << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 5555
CMD ["npx", "prisma", "studio", "--port", "5555", "--hostname", "0.0.0.0"]
EOF
    fi
}

# Deploy
deploy() {
    echo -e "${CYAN}Starting deployment...${NC}"

    cd "$DEPLOY_DIR"

    # Run database migrations
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
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
    info+="OSINT Worker: $USE_OSINT_WORKER\n"
    info+="Admin Tools: $USE_ADMIN_TOOLS\n\n"

    if [ "$USE_CADDY" = "true" ]; then
        info+="Main Site: https://$DOMAIN\n"
        info+="WebSocket: wss://$DOMAIN/ws\n"
    else
        info+="Main Site: http://localhost:3000\n"
        info+="WebSocket: ws://localhost:8080\n"
    fi

    if [ "$USE_ADMIN_TOOLS" = "true" ]; then
        info+="Prisma Studio: https://$ADMIN_DOMAIN\n"
        info+="  Username: admin\n"
        info+="  Password: admin (CHANGE THIS!)\n\n"
    fi

    info+="Database:\n"
    info+="  Host: db\n"
    info+="  Database: sword_intel\n"
    info+="  User: swordintel\n"
    info+="  Password: $DB_PASSWORD\n\n"

    info+="Directory: $DEPLOY_DIR\n\n"
    info+="View logs: docker logs swordintel-nextjs-app\n"
    info+="Stop: docker-compose -f docker-compose.prod.yml down\n"
    info+="Restart: docker-compose -f docker-compose.prod.yml restart\n\n"

    info+="Update Caddy basicauth password:\n"
    info+="  caddy hash-password --plaintext 'your-password'\n"

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
    generate_env_file
    generate_docker_compose
    generate_dockerfiles
    deploy
    show_deployment_info
}

main "$@"
