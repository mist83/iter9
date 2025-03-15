using Microsoft.EntityFrameworkCore;
using Amazon.S3;
using Amazon.DynamoDBv2;
using Amazon.Extensions.NETCore.Setup;
using System.Runtime.InteropServices;
using Swashbuckle.AspNetCore.Filters;
using System.Reflection;
using CRUDite;

var builder = WebApplication.CreateBuilder(args);

// Determine SQLite file path
string databasePath;
if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
{
    databasePath = "/tmp/crudite.db";  // AWS Lambda storage
}
else
{
    databasePath = "C:\\temp\\crudite.db";  // Local development
}

// Register AWS services
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonDynamoDB>();

// Register SQLite persistence helpers
builder.Services.AddSingleton<S3Helper>(sp =>
{
    var s3Client = sp.GetRequiredService<IAmazonS3>();
    return new S3Helper(s3Client, "crud-ite", "database.db", databasePath);
});

builder.Services.AddSingleton<DynamoDbLockManager>();

// Configure EF Core with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath};Pooling=False"));

// Standard ASP.NET setup
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.ExampleFilters(); // Ensure Swagger can use example providers
    options.ParameterFilter<DynamicNameParameterFilter>();
    options.OperationFilter<DynamicExampleFilter>(); 
});

builder.Services.AddSwaggerExamplesFromAssemblies(Assembly.GetExecutingAssembly()); // Registers ExampleShape

var app = builder.Build();

// Ensure the database is fetched from S3 on startup
using (var scope = app.Services.CreateScope())
{
    var s3Helper = scope.ServiceProvider.GetRequiredService<S3Helper>();
    await s3Helper.EnsureDatabaseFileAsync();

    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();

    var dynamoDbLockManager = scope.ServiceProvider.GetRequiredService<DynamoDbLockManager>();
    await dynamoDbLockManager.EnsureTableExistsAsync(); // Ensure DynamoDB table is ready
}


// Add our new middleware here
app.UseMiddleware<DynamoDbLockMiddleware>();

// Setup middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();
