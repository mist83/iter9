using Amazon.S3;
using Iter9;
using Iter9.Controllers;

// HACK
Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", Environment.GetEnvironmentVariable("_AWS_ACCESS_KEY_ID"));
Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", Environment.GetEnvironmentVariable("_AWS_SECRET_ACCESS_KEY"));

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddTransient<IDataStoreService, S3ResourceService>();
builder.Services.AddTransient(x =>
{
    return new Config
    {
        DataRoot = Environment.GetEnvironmentVariable("S3_BUCKET"),
        DataPath = "snapshots"
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
