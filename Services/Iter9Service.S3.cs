using Amazon.S3.Model;
using System.IO.Compression;
using System.Text;

namespace Iter9.Services;

public partial class Iter9Service
{
    public async Task CopyAllKeysAsync(string oldPrefix, string newPrefix, bool delete = false)
    {
        var listResponse = await s3Client.ListObjectsV2Async(new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = oldPrefix
        });

        foreach (var s3Object in listResponse.S3Objects)
        {
            var oldKey = s3Object.Key;
            var newKey = newPrefix + oldKey.Substring(oldPrefix.Length);

            // Copy the object to the new key
            await s3Client.CopyObjectAsync(new CopyObjectRequest
            {
                SourceBucket = bucketName,
                SourceKey = oldKey,
                DestinationBucket = bucketName,
                DestinationKey = newKey
            });

            if (delete)
            {
                await s3Client.DeleteObjectAsync(new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key = oldKey
                });
            }
        }
    }

    public async Task MoveAllKeysAsync(string oldPrefix, string newPrefix)
    {
        await CopyAllKeysAsync(oldPrefix, newPrefix, true);
    }

    public async Task DeleteAsync(string key)
    {
        await s3Client.DeleteAsync(bucketName, key, new Dictionary<string, object>());
    }

    public async Task<bool> ExistsAsync(string key)
    {
        // List is only eventually consistent, we're dealt with this try/catch nastiness FN
        try
        {
            await s3Client.GetObjectMetadataAsync(bucketName, key);
            return true; 
        }
        catch (Amazon.S3.AmazonS3Exception e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    private async Task CopyKeyAsync(string sourceBucket, string sourceKey, string destinationBucket, string destinationKey)
    {
        var copyRequest = new CopyObjectRequest
        {
            SourceBucket = sourceBucket,
            SourceKey = sourceKey,
            DestinationBucket = destinationBucket,
            DestinationKey = destinationKey
        };

        await s3Client.CopyObjectAsync(copyRequest);
        Console.WriteLine($"File copied successfully from {sourceKey} to {destinationKey}");
    }

    public async Task<MemoryStream> ZipAsync(string prefix)
    {
        var zipStream = new MemoryStream();
        using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            var listResponse = await s3Client.ListObjectsV2Async(new ListObjectsV2Request
            {
                BucketName = bucketName,
                Prefix = prefix
            });

            foreach (var s3Object in listResponse.S3Objects)
            {
                using var getResponse = await s3Client.GetObjectAsync(new GetObjectRequest
                {
                    BucketName = bucketName,
                    Key = s3Object.Key
                });

                using var responseStream = getResponse.ResponseStream;
                var entry = archive.CreateEntry(s3Object.Key, CompressionLevel.Optimal);

                using var entryStream = entry.Open();
                await responseStream.CopyToAsync(entryStream);
            }
        }

        zipStream.Position = 0;

        return zipStream;
    }

    public async Task<string> GetTextAsync(string key)
    {
        var getObjectRequest = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };

        var response = await s3Client.GetObjectAsync(getObjectRequest);

        using var reader = new StreamReader(response.ResponseStream, Encoding.UTF8);
        var fileContents = await reader.ReadToEndAsync();

        return fileContents;
    }
}
