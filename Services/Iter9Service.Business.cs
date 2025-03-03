using Amazon.S3.Model;
using Iter9.Model;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Iter9.Services;

public partial class Iter9Service
{
    public async Task<string> ScoopAsync(string project, string folder, FileDetail fileDetail)
    {
        await UploadText(project, folder, fileDetail.Name, fileDetail.Content);
        return $"{project}/{folder}/{fileDetail.Name}";
    }

    public async Task<string[]> GetProjectNamesAsync()
    {
        var keys = new List<string>();

        var response = await s3Client.ListObjectsV2Async(new ListObjectsV2Request
        {
            BucketName = bucketName
        });

        foreach (var obj in response.S3Objects)
        {
            keys.Add(obj.Key);
        }

        keys = keys.Select(x => x.Split('/')[0]).Distinct().OrderBy(x => x).ToList();

        return keys.ToArray();
    }

    public async Task<ProjectDetail> GetProjectDetailsAsync(string project)
    {
        var keys = new List<string>();

        var response = await s3Client.ListObjectsV2Async(new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = project + "/"
        });

        foreach (var obj in response.S3Objects)
        {
            keys.Add(obj.Key);
        }

        keys = keys.OrderByDescending(x => x).ToList();

        var folders = new List<FolderDetail>();

        var folderKeys = keys.Select(x => x.Split("/").Skip(1).First()).Distinct().ToArray();
        foreach (var folder in folderKeys)
        {
            var matchingKeys =
                await Task.WhenAll(keys
                .Where(x => x.StartsWith($"{project}/{folder}/"))
                .Select(async x =>
                {
                    var contentType = x.Split(".").Last();
                    var content = await GetTextAsync(x);

                    var fileDetail = new FileDetail(x.Substring($"{project}/{folder}/".Length), contentType, content);

                    return fileDetail;
                })
                .ToArray());

            folders.Add(new FolderDetail(folder, matchingKeys));
        }

        return new ProjectDetail(project, folders.ToArray());
    }

    public async Task<FileDetail> GetFileAsync(string project, string folder, string fileName)
    {
        if (project == "*")
        {
            var names = await GetProjectNamesAsync();
            project = names.OrderBy(x => Guid.NewGuid()).First();
        }

        var details = await GetProjectDetailsAsync(project);
        if (folder == "*")
        {
            var resource = details.Folders.OrderBy(x => Guid.NewGuid()).First();
        }
        else if (!details.Folders.Any(x => x.Name == folder))
        {
            return null;
        }

        var key = $"{project}/{folder}/{fileName}";
        var contentType = "text/plain";

        switch (fileName.Split(".").Last().ToLower())
        {
            case "html":
                contentType = "text/html";
                break;
            case "css":
                contentType = "text/css";
                break;
            case "js":
                contentType = "text/javascript";
                break;
            default:
                break;
        }

        var getObjectRequest = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };

        var response = await s3Client.GetObjectAsync(getObjectRequest);

        using var reader = new StreamReader(response.ResponseStream, Encoding.UTF8);
        var fileContent = await reader.ReadToEndAsync();

        return new FileDetail(key, contentType, fileContent);
    }


    public async Task<string[]> GetAnomalousFileNamesAsync()
    {
        var anomalousFiles = new List<string>();
        string continuationToken = null;

        do
        {
            var request = new ListObjectsV2Request
            {
                BucketName = bucketName,
                ContinuationToken = continuationToken
            };

            var response = await s3Client.ListObjectsV2Async(request);
            continuationToken = response.NextContinuationToken;

            // Regex pattern to match "xxxxx/yyyyyyy.zzz"
            var validPattern = new Regex(@"^[^/]+/[^/]+/[^/]+\.[^/]+$");

            // Filter out anomalous files
            anomalousFiles.AddRange(response.S3Objects
                .Select(o => o.Key)
                .Where(key => !validPattern.IsMatch(key)));

        } while (continuationToken != null);

        return anomalousFiles.ToArray();
    }

    public async Task<string[]> RenameAnomalousFilesAsync(Dictionary<string, string> renameMapping)
    {
        var renamed = await Task.WhenAll(renameMapping
            .Where(x => x.Key != x.Value)
            .Select(kvp => Task.Run(async () =>
            {
                await s3Client.CopyObjectAsync(bucketName, kvp.Key, bucketName, kvp.Value);
                await s3Client.DeleteObjectAsync(bucketName, kvp.Key);

                return kvp.Value;
            })));

        return renamed;
    }

    public async Task<MemoryStream> ZipAsync(string project = null, string folder = null)
    {
        var prefix = string.Empty;
        if (project != null)
        {
            prefix = project + "/";
        }
        if (folder != null)
        {
            prefix = folder + "/";
        }

        var zipStream = await ZipAsync(prefix);
        return zipStream;
    }

    private async Task UploadText(string project, string folder, string fileName, string text)
    {
        var key = $"{project}/{folder}/{fileName}".Trim('/');

        if (await ExistsAsync(key))
        {
            string timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss", CultureInfo.InvariantCulture);
            string directory = Path.GetDirectoryName(key);
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(key);
            string extension = Path.GetExtension(key);

            string backupFileName = $"{fileNameWithoutExtension}.backup.{timestamp}{extension}";
            string backupKey = string.IsNullOrEmpty(directory) ? backupFileName : Path.Combine(directory, backupFileName);

            await CopyKeyAsync(bucketName, key, bucketName, backupKey);
        }

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(text));
        var response = await s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = stream,
            ContentType = "text/plain"
        });
    }
}
