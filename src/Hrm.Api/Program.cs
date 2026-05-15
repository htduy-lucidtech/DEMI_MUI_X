using Hrm.Infrastructure.Data;
using Hrm.Service.Implementations;
using Hrm.Service.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

using Hrm.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();

builder.Services.AddEndpointsApiExplorer();

// 1. Swagger Configuration
builder.Services.AddSwaggerConfiguration();

// 2. Register Application Services & Database
builder.Services.AddApplicationServices(builder.Configuration);

// 3. JWT Authentication Configuration
builder.Services.AddJwtAuthentication(builder.Configuration);

// 4. CORS Configuration
builder.Services.AddCors(options => {
    options.AddPolicy("HrmPolicy", policy => {
        var allowedOrigins = builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>()
            ?? builder.Configuration.GetValue<string>("CORS__AllowedOrigins")?.Split(',')
            ?? ["https://hrm-web-a0u2.onrender.com", "http://localhost:3000"];

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database
if (builder.Configuration.GetValue<bool>("SeedDatabase"))
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<HrmDbContext>();
            await Hrm.Infrastructure.Data.DbInitializer.SeedAsync(context);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}

// Startup checks: verify database connection, pending migrations and Notification.MetaJson column
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<HrmDbContext>();
        logger.LogInformation("Running startup checks...");

        var canConnect = await context.Database.CanConnectAsync();
        if (!canConnect)
        {
            logger.LogError("Database connection failed during startup checks.");
        }

        var pending = (await context.Database.GetPendingMigrationsAsync()).ToList();
        if (pending.Any())
        {
            logger.LogWarning("There are {Count} pending EF Core migrations.", pending.Count);
            if (builder.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
            {
                logger.LogInformation("ApplyMigrationsOnStartup=true — applying migrations now.");
                await context.Database.MigrateAsync();
                logger.LogInformation("Migrations applied.");
            }
            else
            {
                logger.LogWarning("ApplyMigrationsOnStartup is false — pending migrations were not applied.");
            }
        }
        else
        {
            logger.LogInformation("No pending migrations.");
        }

        // Quick check that Notifications.MetaJson column exists (will throw if missing)
        try
        {
            await context.Database.ExecuteSqlRawAsync("SELECT \"MetaJson\" FROM \"Notifications\" LIMIT 1;");
            logger.LogInformation("Verified Notifications.MetaJson column exists.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Notifications.MetaJson column check failed. If you recently added the field, create/apply migration.");
        }
    }
    catch (Exception ex)
    {
        var logger2 = services.GetRequiredService<ILogger<Program>>();
        logger2.LogError(ex, "Startup checks failed.");
    }
}

// Configure the HTTP request pipeline.
app.UseStaticFiles();

if (app.Environment.IsDevelopment() || true) // Enable in prod for demo if needed
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
        c.InjectStylesheet("/swagger-ui/custom.css");
        c.DocumentTitle = "HRM API Documentation";
        c.DefaultModelsExpandDepth(-1); // Hide schemas by default for cleaner look
    });
}

// app.UseHttpsRedirection();
app.UseWebSockets();
app.UseCors("HrmPolicy");
app.UseAuthentication(); // Must be before UseAuthorization
app.UseAuthorization();

app.MapControllers();
app.MapHub<Hrm.Api.Hubs.NotificationHub>("/notificationHub");

app.Run();
