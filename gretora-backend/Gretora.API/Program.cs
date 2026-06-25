using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Gretora.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ✅ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Controllers
builder.Services.AddControllers();

// ✅ Services
builder.Services.AddScoped<DatabaseService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<R2Service>();
builder.Services.AddScoped<VideoService>();
builder.Services.AddScoped<GreetingService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<LogService>();
builder.Services.AddHostedService<LogCleanupWorker>();

// ✅ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://vizhiq.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ✅ Auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["Supabase:Url"] + "/auth/v1";
    options.RequireHttpsMetadata = false;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Supabase:Url"] + "/auth/v1",
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// ✅ Initialize Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbService = scope.ServiceProvider.GetRequiredService<DatabaseService>();
        dbService.InitializeDatabase();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] Failed to initialize database: {ex.Message}");
    }
}

// ✅ Swagger middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Pipeline
// ✅ Global Error Handler Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var logService = context.RequestServices.GetRequiredService<LogService>();
        var requestUrl = $"{context.Request.Method} {context.Request.Path}{context.Request.QueryString}";
        await logService.LogAsync("ERROR", "Backend", $"Unhandled Server Exception: {ex.Message}", $"Request URL: {requestUrl}\n\nStackTrace: {ex.StackTrace}");
        
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "An internal server error occurred. This has been logged." });
    }
});

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
