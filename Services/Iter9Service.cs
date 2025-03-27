using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Peeper.Db;

namespace Iter9.Services;

public partial class Iter9Service
{
    private readonly IAmazonS3 s3Client;
    private readonly PeepDatabaseContext peepContext;
    private string bucketName = Environment.GetEnvironmentVariable("DATA_BUCKET");

    public Iter9Service(IAmazonS3 s3Client, PeepDatabaseContext peepContext)
    {
        if (string.IsNullOrWhiteSpace(bucketName))
        {
            throw new ArgumentException("Environment variable 'DATA_BUCKET' is not set or empty.");
        }

        this.s3Client = s3Client;
        this.peepContext = peepContext;
    }
}
public partial class Iter9Service
{
    private static object padlock = new object();

    public async Task<ActionResult<string>> CreateOrUpdatePeepAsync([FromBody] PeepModel peep)
    {
        var existingChat = await peepContext.Chats.SingleOrDefaultAsync(x => x.Id == peep.ChatId);
        if (existingChat == null)
        {
            lock (padlock)
            {
                existingChat = peepContext.Chats.SingleOrDefault(x => x.Id == peep.ChatId);
                if (existingChat == null)
                {
                    lock (padlock)
                    {
                        peepContext.Add(new Chat { Id = peep.ChatId });
                        peepContext.SaveChanges();
                    }
                }
            }
        }

        var existingPeep = await peepContext.Peeps.SingleOrDefaultAsync(x => x.Id == peep.Id);
        var finalPeep = existingPeep ?? new Peep { Id = peep.Id };

        finalPeep.Date = DateTime.UtcNow;
        if (existingPeep == null)
        {
            finalPeep.Chat = existingChat;
        }

        finalPeep.Order = peep.Order;
        finalPeep.Type = peep.Type;
        finalPeep.Content = peep.Content;

        if (existingPeep == null)
        {
            await peepContext.Peeps.AddAsync(finalPeep);
        }

        if (existingPeep == null)
        {
            lock (padlock)
            {
                // todo: reload database
                // recheck
                if (existingPeep != null)
                {
                    lock (padlock)
                    {
                    }
                }
            }
        }

        await peepContext.SaveChangesAsync();

        return peep.Id;
    }
}

public class PeepDatabaseContext : DbContext
{
    private static string bucketName = "lorem-ipzom";
    private readonly IAmazonS3 amazonS3;

    public PeepDatabaseContext(DbContextOptions options, IAmazonS3 amazonS3)
        : base(options)
    {
        this.amazonS3 = amazonS3;
    }

    public DbSet<Chat> Chats { get; set; }

    public DbSet<Peep> Peeps { get; set; }

    public DbSet<PeepTag> Tags { get; set; }

    private static string databaseHash;

    private static object padlock = new object();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var localFile = @"Z:\code\Peeper\Db\peeps.db";

        //if (!Debugger.IsAttached)
        {
            if (databaseHash == null)
            {
                lock (padlock)
                {
                    if (databaseHash == null)
                    {
                        var request = new GetObjectRequest
                        {
                            BucketName = bucketName,
                            Key = ".peeps.db"
                        };

                        using GetObjectResponse response = amazonS3.GetObjectAsync(request).Result;
                        using MemoryStream memoryStream = new MemoryStream();
                        response.ResponseStream.CopyToAsync(memoryStream).Wait();
                        var bytes = memoryStream.ToArray();

                        localFile = Path.Combine(Path.GetTempPath(), "peeper", ".peeps.db");
                        Directory.CreateDirectory(new FileInfo(localFile).Directory.FullName);
                        File.WriteAllBytes(localFile, bytes);

                        databaseHash = "hack";
                    }
                }
            }
        }

        optionsBuilder.UseSqlite(@$"Data Source={localFile}");
    }
}

