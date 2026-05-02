using Hrm.Infrastructure.Data;
using Hrm.Service.Implementations;
using Hrm.Service.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

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

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRM API", Version = "v1" });
    
    // Cấu hình nút Authorize trên Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 1. Kết nối Database (Lấy chuỗi connection từ appsettings.json)
builder.Services.AddDbContext<HrmDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"].FirstOrDefault();
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 3. Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<Hrm.Service.Interfaces.IAttendanceService, Hrm.Service.Implementations.AttendanceService>();
// Notification service (implementation lives in Hrm.Api.Services)
builder.Services.AddScoped<Hrm.Service.Interfaces.INotificationService, Hrm.Api.Services.NotificationService>();

// 4. Cấu hình CORS (Cho phép Next.js truy cập)
builder.Services.AddCors(options => {
    options.AddPolicy("HrmPolicy", policy => {
        policy.WithOrigins("http://localhost:3000") // Port của hrm.web
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
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
