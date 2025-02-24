using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Iter9.Controllers;

namespace Iter9;

public class S3ResourceService : IDataStoreService
{
    private readonly IAmazonS3 s3Client;
    private readonly string bucketName;

    public S3ResourceService(IAmazonS3 s3Client, Config config)
    {
        this.s3Client = s3Client ?? throw new ArgumentNullException(nameof(s3Client));
        bucketName = config.DataRoot;
    }

    public char PathCharacter => '/';

    public async Task<string> SaveAsync(string key, string body)
    {
        using (var stream = GenerateStreamFromString(body))
        {
            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = stream
            };
            await s3Client.PutObjectAsync(request);
        }

        return key;
    }

    public async Task<string> GetAsync(string key)
    {
        string objectKey = key;
        var request = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = objectKey
        };

        using (var response = await s3Client.GetObjectAsync(request))
        using (var streamReader = new StreamReader(response.ResponseStream))
        {
            return await streamReader.ReadToEndAsync();
        }
    }

    public async Task DeleteAsync(string key)
    {
        await s3Client.DeleteAsync(bucketName, key, new Dictionary<string, object>());
    }

    public async Task<string> SaveAsync(string key, byte[] blobResource)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = new MemoryStream(blobResource),
            ContentType = "application/octet-stream" // Generic MIME type for binary data
        };

        await s3Client.PutObjectAsync(putRequest);

        return key; // Return the S3 key used to save the resource
    }

    public async Task<byte[]> GetAsBinaryAsync(string key)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };

        using (var response = await s3Client.GetObjectAsync(getRequest))
        using (var memoryStream = new MemoryStream())
        {
            await response.ResponseStream.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }
    }

    public async Task<string[]> ListKeysAsync()
    {
        var keys = new List<string>();
        string continuationToken = null;

        do
        {
            var request = new ListObjectsV2Request
            {
                BucketName = bucketName,
                ContinuationToken = continuationToken, // This helps paginate through results
                MaxKeys = 1000 // Adjust if needed, 1000 is the S3 max
            };

            var response = await s3Client.ListObjectsV2Async(request);
            keys.AddRange(response.S3Objects.Select(x => x.Key));

            continuationToken = response.NextContinuationToken; // Continue if more results exist

        } while (!string.IsNullOrEmpty(continuationToken)); // Stop when there's no more data

        return keys.ToArray();
    }


    public async Task<List<string>> ListKeysAsync(string substring = "")
    {
        var keys = await GetKeysFromS3Async();
        var list = keys.Where(key => key.Contains(substring)).ToList();

        list = list.OrderByDescending(x => x).ToList();

        return list;
    }

    private async Task<List<string>> GetKeysFromS3Async()
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName
        };

        var response = await s3Client.ListObjectsV2Async(request);

        return response.S3Objects
            .Select(obj => obj.Key.Replace(".txt", "").Replace(".json", ""))
            .Distinct()
            .ToList();
    }

    private static Stream GenerateStreamFromString(string text)
    {
        var stream = new MemoryStream();
        var writer = new StreamWriter(stream);
        writer.Write(text);
        writer.Flush();
        stream.Position = 0;
        return stream;
    }
}