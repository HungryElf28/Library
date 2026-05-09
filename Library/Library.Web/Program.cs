using Library.Application.Services;
using Library.Domain.Interfaces;
using Library.Infrastructure.Data;
using Library.Infrastructure.Data.Models;
using Library.Infrastructure.Repositories;
using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.StaticFiles;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IGenreRepository, GenreRepository>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ICollectionRepository, CollectionRepository>();

builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<GenreService>();
builder.Services.AddScoped<AuthorService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<CollectionService>();
builder.Services.AddScoped<UserService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG"))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
Directory.CreateDirectory(uploadsPath);

app.UseHttpsRedirection();

var contentTypeProvider = new FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".epub"] = "application/epub+zip";
contentTypeProvider.Mappings[".fb2"] = "application/x-fictionbook+xml";
contentTypeProvider.Mappings[".rtf"] = "application/rtf";
contentTypeProvider.Mappings[".mobi"] = "application/x-mobipocket-ebook";
contentTypeProvider.Mappings[".azw3"] = "application/vnd.amazon.ebook";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    ContentTypeProvider = contentTypeProvider,
    OnPrepareResponse = context =>
    {
        var origin = context.Context.Request.Headers.Origin.ToString();
        if (origin == "http://localhost:3000"
            || origin == "http://127.0.0.1:3000"
            || origin == "http://localhost:5173"
            || origin == "http://127.0.0.1:5173")
        {
            context.Context.Response.Headers.AccessControlAllowOrigin = origin;
            context.Context.Response.Headers.Vary = "Origin";
        }
    }
});

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    int maxRetries = 10;
    int retryDelay = 3000;
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            logger.LogInformation("Attempt {Attempt} of {MaxRetries}: Applying database migrations...", i + 1, maxRetries);
            dbContext.Database.Migrate();
            logger.LogInformation("Database migrations applied successfully.");

            if (!dbContext.Roles.Any())
            {
                dbContext.Roles.AddRange(
                    new Role { Id = 1, Role1 = "Admin" },
                    new Role { Id = 2, Role1 = "User" }
                );
                dbContext.SaveChanges();
                logger.LogInformation("Roles seeded.");
            }

            var adminConfig = builder.Configuration.GetSection("DefaultAdmin");
            var adminLogin = adminConfig["Login"] ?? "admin";
            var adminPassword = adminConfig["Password"] ?? "password";
            var adminEmail = adminConfig["Email"] ?? "admin@example.com";

            if (!dbContext.Users.Any(u => u.Login == adminLogin))
            {
                var adminRole = dbContext.Roles.First(r => r.Role1 == "Admin");
                var adminUser = new User
                {
                    Login = adminLogin,
                    Email = adminEmail,
                    NormalizedLogin = adminLogin.ToUpperInvariant(),
                    NormalizedEmail = adminEmail.ToUpperInvariant(),
                    RoleId = adminRole.Id
                };
                var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
                adminUser.PasswordHash = hasher.HashPassword(adminUser, adminPassword);
                
                dbContext.Users.Add(adminUser);
                dbContext.SaveChanges();
                logger.LogInformation("Admin user seeded: {Login}", adminLogin);
            }

            break;
        }
        catch (Exception ex)
        {
            if (i == maxRetries - 1)
            {
                logger.LogError(ex, "Failed to apply migrations after {MaxRetries} attempts.", maxRetries);
                throw;
            }
            
            logger.LogWarning("Migration attempt {Attempt} failed: {Message}. Retrying in {DelaySeconds} seconds...", 
                i + 1, ex.Message, retryDelay / 1000);
            await Task.Delay(retryDelay);
        }
    }
}

app.Run();
