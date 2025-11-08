# Multi-stage Dockerfile for SWORD Intelligence ASP.NET Core
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy solution and project files
COPY SwordIntel.sln ./
COPY src/SwordIntel.Web/SwordIntel.Web.csproj src/SwordIntel.Web/
COPY src/SwordIntel.Core/SwordIntel.Core.csproj src/SwordIntel.Core/
COPY src/SwordIntel.Infrastructure/SwordIntel.Infrastructure.csproj src/SwordIntel.Infrastructure/
COPY src/SwordIntel.Crypto/SwordIntel.Crypto.fsproj src/SwordIntel.Crypto/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY src/ src/

# Build application
WORKDIR /src/src/SwordIntel.Web
RUN dotnet build -c Release -o /app/build

# Publish application
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1000 swordintel && \
    adduser -D -u 1000 -G swordintel swordintel

# Copy published app
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R swordintel:swordintel /app

# Switch to non-root user
USER swordintel

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "SwordIntel.Web.dll"]
