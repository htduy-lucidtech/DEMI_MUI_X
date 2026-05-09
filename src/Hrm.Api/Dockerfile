# =====================================================================
# Stage 1: Build & Publish (restore + publish in one stage)
# =====================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS publish
WORKDIR /src

# Copy solution + project files first (cache layer for dotnet restore)
COPY src/Hrm.slnx ./src/
COPY src/Hrm.Api/Hrm.Api.csproj ./src/Hrm.Api/
COPY src/Hrm.Domain/Hrm.Domain.csproj ./src/Hrm.Domain/
COPY src/Hrm.Infrastructure/Hrm.Infrastructure.csproj ./src/Hrm.Infrastructure/
COPY src/Hrm.Service/Hrm.Service.csproj ./src/Hrm.Service/

RUN dotnet restore ./src/Hrm.Api/Hrm.Api.csproj

# Copy full source code
COPY src/ ./src/

RUN dotnet publish ./src/Hrm.Api/Hrm.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# =====================================================================
# Stage 2: Runtime image
# =====================================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Hrm.Api.dll"]
