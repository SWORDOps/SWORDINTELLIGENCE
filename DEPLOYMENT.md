# SWORD Intelligence - Production Deployment Guide

Automated deployment scripts for both Next.js and ASP.NET Core platforms with Caddy reverse proxy, SSL, and TUI-based configuration.

---

## 🚀 Quick Start

Both platforms include **interactive deployment scripts** that can be run from anywhere on your server:

### ASP.NET Core Platform

```bash
curl -fsSL https://raw.githubusercontent.com/SWORDOps/SWORDINTELLIGENCE/main/deploy-aspnet.sh | bash
```

Or manually:

```bash
git clone https://github.com/SWORDOps/SWORDINTELLIGENCE.git
cd SWORDINTELLIGENCE
chmod +x deploy-aspnet.sh
./deploy-aspnet.sh
```

### Next.js Platform

```bash
curl -fsSL https://raw.githubusercontent.com/SWORDOps/SWORDINTELLIGENCE/main/deploy-nextjs.sh | bash
```

Or manually:

```bash
git clone https://github.com/SWORDOps/SWORDINTELLIGENCE.git
cd SWORDINTELLIGENCE
chmod +x deploy-nextjs.sh
./deploy-nextjs.sh
```

---

## 📋 Prerequisites

Before running the deployment scripts, ensure your server has:

- **Docker** (20.10+)
- **Docker Compose** (1.29+ or Docker Compose V2)
- **Git**
- **Dialog** or **Whiptail** (for TUI)
- **OpenSSL** (for generating secrets)

### Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git dialog openssl curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose git dialog openssl curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

**After adding user to docker group, logout and login again.**

---

## 🎛️ Deployment Modes

Both scripts offer multiple deployment configurations via TUI:

### ASP.NET Core Platform

1. **Development (Local, no SSL)**
   - Runs on localhost:5000
   - No reverse proxy
   - PostgreSQL + Redis + ASP.NET app
   - Best for: Local development

2. **Production (Domain + SSL via Caddy)**
   - Automatic SSL via Let's Encrypt
   - Caddy reverse proxy
   - PostgreSQL + Redis + ASP.NET app
   - Best for: Production deployment

3. **Production + Admin Tools**
   - Everything from Production mode
   - pgAdmin (PostgreSQL management)
   - Redis Commander (Redis management)
   - Accessible via admin subdomain
   - Best for: Production with database management

4. **Custom Configuration**
   - Fully customizable options
   - Choose individual components
   - Advanced users only

### Next.js Platform

1. **Development (Local, no SSL)**
   - Runs on localhost:3000
   - WebSocket on localhost:8080
   - No reverse proxy
   - Best for: Local development

2. **Production (Domain + SSL via Caddy)**
   - Automatic SSL via Let's Encrypt
   - Caddy reverse proxy
   - WebSocket proxying
   - Next.js + WebSocket + PostgreSQL + Redis
   - Best for: Production deployment

3. **Production + OSINT Worker**
   - Everything from Production mode
   - Background OSINT feed synchronization
   - Automated threat intelligence updates
   - Best for: Full intelligence platform

4. **Full Stack (Everything + Admin Tools)**
   - Everything from Production + OSINT Worker
   - Prisma Studio (database management)
   - Accessible via admin subdomain
   - Best for: Complete deployment

5. **Custom Configuration**
   - Fully customizable options
   - Choose individual components
   - Advanced users only

---

## 🔧 Configuration Options

The TUI will prompt you for:

### Required for Production Deployments

- **Domain Name**: Your public domain (e.g., `swordintel.example.com`)
- **Email**: For Let's Encrypt SSL certificates
- **Database Password**: PostgreSQL password (auto-generated if left empty)
- **JWT/NextAuth Secret**: Authentication secret (auto-generated if left empty)

### Optional

- **Admin Subdomain**: For admin tools (default: `admin.yourdomain.com`)
- **API Keys**:
  - AlienVault OTX API Key (Next.js only)
  - VirusTotal API Key (Next.js only)
- **Branch**: Git branch to deploy (default: `main`)
- **Deploy Directory**: Installation directory (default: `/opt/swordintel-*`)

---

## 🌐 DNS Configuration

Before running production deployments, configure your DNS:

### For Main Site

Create an **A record** pointing to your server's IP:

```
swordintel.example.com  →  YOUR_SERVER_IP
```

### For Admin Tools (if enabled)

Create an **A record** for admin subdomain:

```
admin.swordintel.example.com  →  YOUR_SERVER_IP
```

**Note**: DNS propagation can take up to 48 hours, but usually completes within minutes.

---

## 🔐 SSL Certificates

Both scripts use **Caddy** for automatic SSL certificate management:

- **Automatic**: Caddy requests certificates from Let's Encrypt
- **Renewal**: Certificates auto-renew before expiration
- **HTTP/3**: Enabled by default (QUIC)
- **Security Headers**: Automatically configured (HSTS, CSP, etc.)

### Requirements for Let's Encrypt

1. Domain must resolve to your server's IP
2. Ports 80 and 443 must be open
3. Valid email address for certificate notifications

---

## 📂 Deployment Structure

### ASP.NET Core Platform

```
/opt/swordintel-aspnet/
├── src/                           # ASP.NET Core source
│   ├── SwordIntel.Web/
│   ├── SwordIntel.Core/
│   ├── SwordIntel.Infrastructure/
│   ├── SwordIntel.Crypto/
│   ├── docker-compose.prod.yml    # Generated production compose
│   └── Dockerfile
├── Caddyfile.aspnet               # Generated Caddy config
└── .git/                          # Git repository
```

### Next.js Platform

```
/opt/swordintel-nextjs/
├── app/                           # Next.js app
├── lib/                           # Libraries
├── server/                        # WebSocket server
├── scripts/                       # OSINT worker
├── docker-compose.prod.yml        # Generated production compose
├── Dockerfile.nextjs              # Generated Next.js Dockerfile
├── Dockerfile.websocket           # Generated WebSocket Dockerfile
├── Dockerfile.osint               # Generated OSINT Dockerfile
├── Dockerfile.studio              # Generated Prisma Studio Dockerfile
├── Caddyfile.nextjs               # Generated Caddy config
├── .env.production                # Generated environment variables
└── .git/                          # Git repository
```

---

## 🔍 Post-Deployment

### Verify Deployment

**Check running containers:**
```bash
docker ps
```

**View logs:**
```bash
# ASP.NET Core
docker logs swordintel-aspnet-web
docker logs swordintel-aspnet-caddy

# Next.js
docker logs swordintel-nextjs-app
docker logs swordintel-nextjs-websocket
docker logs swordintel-nextjs-caddy
```

**Test SSL certificate:**
```bash
curl -I https://yourdomain.com
```

### Access Admin Tools

**ASP.NET Core (if enabled):**
- pgAdmin: `https://admin.yourdomain.com/pgadmin`
- Redis Commander: `https://admin.yourdomain.com/redis`

**Next.js (if enabled):**
- Prisma Studio: `https://admin.yourdomain.com`

**Default credentials:**
- Username: `admin`
- Password: `admin` (⚠️ **CHANGE THIS IMMEDIATELY**)

### Change Admin Password

Generate new password hash:
```bash
docker exec swordintel-*-caddy caddy hash-password --plaintext 'your-new-password'
```

Update `Caddyfile.*` with new hash and restart Caddy:
```bash
docker restart swordintel-*-caddy
```

---

## 🔄 Management Commands

### Start Services

```bash
cd /opt/swordintel-*
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services

```bash
cd /opt/swordintel-*
docker-compose -f docker-compose.prod.yml down
```

### Restart Services

```bash
cd /opt/swordintel-*
docker-compose -f docker-compose.prod.yml restart
```

### Update Deployment

```bash
cd /opt/swordintel-*
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f swordintel-*-web
```

### Database Backup

**PostgreSQL backup:**
```bash
docker exec swordintel-*-postgres pg_dump -U swordintel swordintel > backup.sql
```

**Restore:**
```bash
cat backup.sql | docker exec -i swordintel-*-postgres psql -U swordintel swordintel
```

---

## 🔥 Firewall Configuration

### Ubuntu/Debian (UFW)

```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 443/udp   # HTTP/3 (QUIC)
sudo ufw enable
```

### CentOS/RHEL (firewalld)

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=443/udp
sudo firewall-cmd --reload
```

### Cloud Provider Security Groups

If deploying to AWS, GCP, Azure, etc., ensure security groups allow:
- Port 80 (HTTP)
- Port 443 (HTTPS + HTTP/3 QUIC)

---

## 🐛 Troubleshooting

### SSL Certificate Issues

**Problem**: Let's Encrypt certificate request fails

**Solution**:
1. Verify DNS resolution: `dig yourdomain.com`
2. Check ports 80/443 are accessible: `curl -I http://yourdomain.com`
3. View Caddy logs: `docker logs swordintel-*-caddy`
4. Ensure email is valid
5. Check Let's Encrypt rate limits (5 certs/week/domain)

### Database Connection Issues

**Problem**: App can't connect to PostgreSQL

**Solution**:
1. Check PostgreSQL is running: `docker ps | grep postgres`
2. Verify password in docker-compose.prod.yml
3. Check PostgreSQL logs: `docker logs swordintel-*-postgres`
4. Test connection: `docker exec -it swordintel-*-postgres psql -U swordintel`

### WebSocket Connection Issues (Next.js)

**Problem**: Real-time features not working

**Solution**:
1. Check WebSocket server: `docker logs swordintel-nextjs-websocket`
2. Verify Caddy WebSocket config in Caddyfile
3. Test WebSocket: `wscat -c wss://yourdomain.com/ws`
4. Check Redis connection: `docker logs swordintel-nextjs-redis`

### High Memory Usage

**Problem**: Server running out of memory

**Solution**:
1. Limit container memory in docker-compose.prod.yml:
   ```yaml
   services:
     web:
       deploy:
         resources:
           limits:
             memory: 512M
   ```
2. Increase server RAM
3. Optimize application (reduce build size, enable caching)

### Port Already in Use

**Problem**: "Port 80/443 already in use"

**Solution**:
1. Find process: `sudo lsof -i :80` or `sudo lsof -i :443`
2. Stop conflicting service: `sudo systemctl stop apache2` or `sudo systemctl stop nginx`
3. Or use different ports and configure reverse proxy separately

---

## 🔐 Security Best Practices

### Immediately After Deployment

1. **Change admin passwords** (Caddy basicauth, pgAdmin, etc.)
2. **Rotate secrets** (JWT_SECRET, NEXTAUTH_SECRET, DB_PASSWORD)
3. **Enable firewall** (allow only 80, 443, SSH)
4. **Update packages**: `sudo apt-get update && sudo apt-get upgrade`
5. **Configure fail2ban** (SSH brute force protection)

### Ongoing Security

1. **Monitor logs** regularly
2. **Update Docker images** monthly
3. **Backup database** daily
4. **Review security headers** (scan with SecurityHeaders.com)
5. **Audit access logs** (Caddy logs in `/var/log/caddy/`)

### Environment Variables

**Never commit secrets to git:**
- `.env.production` is generated locally
- Add to `.gitignore`
- Use secrets management (Vault, AWS Secrets Manager, etc.) for production

---

## 📊 Monitoring

### Health Checks

**ASP.NET Core:**
```bash
curl https://yourdomain.com/health
```

**Next.js:**
```bash
curl https://yourdomain.com/api/health
```

### Container Stats

```bash
docker stats
```

### Disk Usage

```bash
docker system df
```

### Cleanup Old Images

```bash
docker system prune -a
```

---

## 📞 Support

For issues or questions:

1. Check logs: `docker logs swordintel-*-web`
2. Review this documentation
3. Check GitHub Issues: https://github.com/SWORDOps/SWORDINTELLIGENCE/issues
4. Contact: secure@sword-intel.example

---

## 📝 Environment Variables Reference

### ASP.NET Core

Generated in `docker-compose.prod.yml`:

```yaml
- ASPNETCORE_ENVIRONMENT=Production
- ASPNETCORE_URLS=http://+:5000
- ConnectionStrings__DefaultConnection=Host=postgres;Database=swordintel;...
- ConnectionStrings__Redis=redis:6379,password=***
- Jwt__Secret=***
- Jwt__Issuer=SwordIntelligence
- Jwt__Audience=SwordIntelClients
- Fido2__ServerDomain=yourdomain.com
```

### Next.js

Generated in `.env.production`:

```env
DATABASE_URL=postgresql://swordintel:***@db:5432/sword_intel
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=***
WEBAUTHN_RP_ID=yourdomain.com
```

---

## 🎯 Production Checklist

Before going live:

- [ ] DNS configured and propagated
- [ ] SSL certificate obtained (automatic via Let's Encrypt)
- [ ] Firewall configured (ports 80, 443)
- [ ] Admin passwords changed
- [ ] Database backups configured
- [ ] Monitoring enabled
- [ ] Security headers verified
- [ ] Environment variables secured
- [ ] Docker volumes persistent
- [ ] Logs rotation configured
- [ ] Health checks passing

---

## 🔄 Updates & Migrations

### Update Application Code

```bash
cd /opt/swordintel-*
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migrations

**ASP.NET Core (EF Core):**
```bash
docker exec swordintel-aspnet-web dotnet ef database update
```

**Next.js (Prisma):**
```bash
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

### Rollback

If deployment fails:

1. **Restore from backup**:
   ```bash
   cat backup.sql | docker exec -i swordintel-*-postgres psql -U swordintel
   ```

2. **Revert to previous commit**:
   ```bash
   git checkout <previous-commit>
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 🌟 Advanced Configuration

### Custom Domain for WebSocket (Next.js)

Edit `Caddyfile.nextjs`:

```
ws.yourdomain.com {
    tls your-email@example.com
    reverse_proxy websocket:8080
}
```

### Multiple Instances (Load Balancing)

Use Docker Swarm or Kubernetes for multi-instance deployments with Redis as shared state.

### External Database

To use external PostgreSQL/Redis, modify `docker-compose.prod.yml` to remove database services and update connection strings.

---

**Last Updated**: November 8, 2025
**Version**: 4.0 - Dual Platform Deployment Scripts
