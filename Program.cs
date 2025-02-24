using Amazon.S3;
using Amazon.SecurityToken;
using Amazon.SecurityToken.Model;
using Iter9;
using Iter9.Controllers;
using System.Diagnostics;

if (Debugger.IsAttached)
{
    // WTF credential chain lol
    string id = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
    string key = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");

    using var stsClient = new AmazonSecurityTokenServiceClient();

    var response = await stsClient.GetCallerIdentityAsync(new GetCallerIdentityRequest());
    Console.WriteLine("Account: \x1b[33m" + response.Account + "\x1b[0m");
    Console.WriteLine("ARN:     \x1b[33m" + response.Arn + "\x1b[0m");
    Console.WriteLine("UserId:  \x1b[33m" + response.UserId + "\x1b[0m");
    Console.WriteLine();
}

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
