using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.EntityFrameworkCore;

public class S3Helper
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _databaseKey;
    private readonly string _localPath;

    public S3Helper(IAmazonS3 s3Client, string bucketName, string databaseKey, string localPath)
    {
        _s3Client = s3Client;
        _bucketName = bucketName;
        _databaseKey = databaseKey;
        _localPath = localPath;
    }

    /// <summary>
    /// Fetches the SQLite database from S3 if it's missing.
    /// </summary>
    public async Task EnsureDatabaseFileAsync()
    {
        if (File.Exists(_localPath))
        {
            Console.WriteLine("Database already exists locally, skipping S3 download.");
            return;
        }

        Console.WriteLine("Fetching database from S3...");
        try
        {
            var response = await _s3Client.GetObjectAsync(_bucketName, _databaseKey);
            using var stream = response.ResponseStream;
            using var fileStream = File.Create(_localPath);
            await stream.CopyToAsync(fileStream);
            Console.WriteLine("Database downloaded successfully.");
        }
        catch (AmazonS3Exception ex)
        {
            Console.WriteLine($"S3 Error: {ex.Message}. Starting with a fresh database.");
        }
    }

    /// <summary>
    /// Uploads the SQLite database to S3 after a write operation.
    /// </summary>
    public async Task UploadDatabaseFileAsync(IServiceScopeFactory scopeFactory)
    {
        Console.WriteLine("Uploading database to S3...");

        try
        {
            // Ensure all transactions are flushed
            using (var scope = scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await dbContext.Database.ExecuteSqlRawAsync("PRAGMA wal_checkpoint(TRUNCATE);");
                await dbContext.Database.CloseConnectionAsync();
                await dbContext.DisposeAsync();
            }

            // Ensure garbage collection removes any pending connections
            GC.Collect();
            GC.WaitForPendingFinalizers();

            // Now, safely open the file for upload with FileShare.ReadWrite
            using var fileStream = new FileStream(_localPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = _databaseKey,
                InputStream = fileStream
            };

            await _s3Client.PutObjectAsync(putRequest);
            Console.WriteLine("Database uploaded successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error uploading database: {ex.Message}");
        }
    }
}
