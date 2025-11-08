# SWORD Intelligence - Quick Start Guide

## 🚀 **One-Command Setup**

### Linux/macOS:
```bash
chmod +x setup.sh
./setup.sh
```

### Windows (PowerShell):
```powershell
.\setup.ps1
```

---

## 📋 **Prerequisites**

- **Docker** & **Docker Compose** (required)
- **.NET 8.0 SDK** (optional, for local development)

### Install Docker

#### macOS:
```bash
brew install --cask docker
```

#### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### Windows:
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🎯 **Deployment Options**

The setup script offers 4 deployment modes:

### 1. Infrastructure Only
Just PostgreSQL + Redis for local development
```bash
./setup.sh
# Choose option 1
```

Then run ASP.NET locally:
```bash
cd src/SwordIntel.Web
dotnet restore
dotnet run
```
Visit: `https://localhost:7001`

### 2. Full Stack
Everything in Docker (PostgreSQL + Redis + ASP.NET)
```bash
./setup.sh
# Choose option 2
```
Visit: `http://localhost:8080`

### 3. With Admin Tools
Infrastructure + pgAdmin + Redis Commander
```bash
./setup.sh
# Choose option 3
```

Admin interfaces:
- pgAdmin: `http://localhost:5050`
- Redis Commander: `http://localhost:8081`

### 4. Everything
Full stack + Admin tools
```bash
./setup.sh
# Choose option 4
```

---

## 🔌 **Connection Details**

### PostgreSQL
```
Host: localhost
Port: 5432
Database: swordintel
Username: swordintel
Password: SwordIntel2024!SecurePass
```

Connection string:
```
Host=localhost;Database=swordintel;Username=swordintel;Password=SwordIntel2024!SecurePass
```

### Redis
```
Host: localhost
Port: 6379
```

Connection string:
```
localhost:6379
```

### pgAdmin (if enabled)
```
URL: http://localhost:5050
Email: admin@swordintel.local
Password: admin
```

### Redis Commander (if enabled)
```
URL: http://localhost:8081
```

---

## 🛠️ **Manual Docker Commands**

### Start Services
```bash
# Infrastructure only
docker-compose up -d postgres redis

# Full stack
docker-compose --profile full up -d

# With admin tools
docker-compose --profile tools up -d

# Everything
docker-compose --profile full --profile tools up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f web
```

### Stop Services
```bash
docker-compose down
```

### Destroy Data (WARNING: Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Application
```bash
docker-compose build web
docker-compose up -d web
```

---

## 🏃 **Local Development**

### Without Docker (requires .NET 8.0 SDK)

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Run ASP.NET**:
   ```bash
   cd src/SwordIntel.Web
   dotnet restore
   dotnet ef database update  # Run migrations
   dotnet run
   ```

3. **Access Application**:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:7001`
   - Health Check: `http://localhost:5000/api/health`

### Watch Mode (Auto-reload)
```bash
dotnet watch run
```

---

## 🗄️ **Database Migrations**

### Create Migration
```bash
cd src/SwordIntel.Web
dotnet ef migrations add MigrationName
```

### Apply Migrations
```bash
dotnet ef database update
```

### Rollback Migration
```bash
dotnet ef database update PreviousMigrationName
```

---

## 🧪 **Testing Endpoints**

### Health Check
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "framework": ".NET 8.0",
  "crypto": "ML-KEM-1024 + ML-DSA-87"
}
```

### PostgreSQL Connection Test
```bash
docker exec -it swordintel-postgres psql -U swordintel -d swordintel -c "SELECT version();"
```

### Redis Connection Test
```bash
docker exec -it swordintel-redis redis-cli ping
```

---

## 🎨 **Theme Toggle**

The site supports two themes:

- **OPS** (Dark/Tactical): Default retro 90s military theme
- **Advisory** (Light/Professional): Intelligence brief style

Toggle via:
- UI theme button
- Browser console: `localStorage.setItem('theme', 'advisory')`

---

## 🔐 **Default Credentials**

### Application (when seeded)
```
Email: admin@swordintel.local
Password: Admin123!
```

### pgAdmin
```
Email: admin@swordintel.local
Password: admin
```

---

## 🐛 **Troubleshooting**

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # Web application

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# View logs
docker-compose logs postgres
docker-compose logs redis

# Recreate container
docker-compose down
docker-compose up -d
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
docker exec swordintel-postgres pg_isready -U swordintel

# Check connection string in appsettings.json
# Make sure it matches docker-compose.yml environment variables
```

### Redis Connection Failed
```bash
# Verify Redis is running
docker exec swordintel-redis redis-cli ping

# Should return: PONG
```

### .NET Build Errors
```bash
# Clean and restore
dotnet clean
dotnet restore
dotnet build
```

---

## 📊 **Monitoring**

### View Container Stats
```bash
docker stats
```

### Check Container Health
```bash
docker-compose ps
```

### Database Size
```bash
docker exec swordintel-postgres psql -U swordintel -d swordintel -c "SELECT pg_size_pretty(pg_database_size('swordintel'));"
```

### Redis Memory Usage
```bash
docker exec swordintel-redis redis-cli info memory
```

---

## 🔄 **Updates**

### Pull Latest Changes
```bash
git pull origin main

# Rebuild containers
docker-compose build
docker-compose up -d
```

### Update Dependencies
```bash
cd src/SwordIntel.Web
dotnet restore
```

---

## 🛑 **Shutdown**

### Stop Services (preserve data)
```bash
docker-compose down
```

### Stop and Remove Data
```bash
docker-compose down -v
```

### Nuclear Option (remove everything)
```bash
docker-compose down -v --rmi all --remove-orphans
```

---

## 📚 **Next Steps**

1. Read `ASP.NET-README.md` for architecture details
2. Explore `/api/health` endpoint
3. Check out the dual-theme system
4. Review F# cryptography modules in `src/SwordIntel.Crypto/`
5. Set up your IDE (VS Code, Rider, Visual Studio)

---

## 🎯 **Production Deployment**

For production deployment, see:
- Update `appsettings.Production.json`
- Set secure passwords
- Enable HTTPS with valid certificates
- Configure external PostgreSQL/Redis instances
- Set up monitoring and logging
- Enable security headers
- Configure rate limiting

---

**🗡️ MISSION READY - Happy Coding!**
