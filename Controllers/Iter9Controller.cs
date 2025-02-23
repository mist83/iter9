using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Iter9.Controllers;


[Route("api/[controller]")]
[ApiController]
public class Iter9Controller : ControllerBase
{
    private readonly Config config;

    private readonly IDataStoreService dataStoreService;

    public Iter9Controller(Config config, IDataStoreService dataStoreService)
    {
        this.config = config;
        this.dataStoreService = dataStoreService;
    }

    private async Task<byte[]> GetResourceBytes(string resource)
    {
        var stream = typeof(Iter9Controller).Assembly.GetManifestResourceStream(resource);
        stream.Position = 0;
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        ms.Position = 0;
        var bytes = ms.ToArray();

        return bytes;
    }

    private async Task<string> GetIndex(string resource)
    {
        var bytes = await GetResourceBytes(resource);

        if (Debugger.IsAttached)
        {
            var final = @"Z:\code\" + resource.Replace(".", @"\");
            final = final.Replace(@"\html", ".html");
            final = final.Replace(@"\css", ".css");
            final = final.Replace(@"\js", ".js");

            bytes = await System.IO.File.ReadAllBytesAsync(final);
        }

        var textContent = Encoding.UTF8.GetString(bytes);
        return textContent;
    }

    #region reorganize

    private static readonly string bucketName = "iter9";
    private static readonly string prefix = "snapshots/iter9_example/";
    private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest2;

    private static string id = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
    private static string key = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
    private static readonly AmazonS3Client s3Client = new AmazonS3Client(id, key, RegionEndpoint.USWest2);
    //private static readonly AmazonS3Client s3Client = new AmazonS3Client(bucketRegion);

    [HttpPost("reorganize")]
    public async Task<IActionResult> RunAsync()
    {
        var fileMappings = new Dictionary<string, string>();

        // Step 1: Get all objects in the bucket with the given prefix
        var allKeys = await ListAllObjectsAsync();

        // Step 2: Group by unique timestamp folders
        var folderGroups = allKeys
            .Select(k => GetFolderFromKey(k))
            .Where(f => f != null)
            .Distinct()
            .ToList();

        Console.WriteLine($"Found {folderGroups.Count} unique folders.");

        var rnd = new Random();
        foreach (var folder in folderGroups)
        {
            string newFolderName = await DetermineNewFolderName(folder);
            if (newFolderName == null) continue; // Skip if something goes wrong

            string oldPath = $"{prefix}{folder}/";
            string newPath = $"codescoops/{newFolderName}/";

            if (!fileMappings.ContainsKey(oldPath))
            {
                var count = fileMappings.Values.Count(x => x == newPath);
                //if (count > 0)
                {
                    newPath += rnd.Next(1000, 10000) + "/";
                }

                fileMappings[oldPath] = newPath;
                PrintChange(oldPath, newPath);
            }
        }

        return Ok(fileMappings);
    }

    private static async Task<List<string>> ListAllObjectsAsync()
    {
        var keys = new List<string>();
        string continuationToken = null;
        do
        {
            var request = new ListObjectsV2Request { BucketName = bucketName, Prefix = prefix, ContinuationToken = continuationToken };

            var response = await s3Client.ListObjectsV2Async(request);

            keys.AddRange(response.S3Objects.Select(o => o.Key));
            continuationToken = response.NextContinuationToken;
        } while (continuationToken != null);

        return keys;
    }

    private static string GetFolderFromKey(string key)
    {
        var match = Regex.Match(key, @"snapshots/iter9_example/(\d{4}_\d{2}_\d{2}-\d{2}_\d{2}_\d{2})/");
        return match.Success ? match.Groups[1].Value : null;
    }

    private static async Task<string> DetermineNewFolderName(string folder)
    {
        var indexHtmlKey = $"{prefix}{folder}/index.html";
        var exists = await ObjectExistsAsync(indexHtmlKey);

        if (exists)
        {
            var title = await ExtractHtmlTitle(indexHtmlKey);
            return title ?? "unknown_html";
        }

        return "unknown_various";
    }

    private static async Task<bool> ObjectExistsAsync(string key)
    {
        try
        {
            await s3Client.GetObjectMetadataAsync(bucketName, key);
            return true;
        }
        catch (AmazonS3Exception e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    private static async Task<string> ExtractHtmlTitle(string key)
    {
        try
        {
            var response = await s3Client.GetObjectAsync(bucketName, key);
            using (var reader = new System.IO.StreamReader(response.ResponseStream))
            {
                var html = await reader.ReadToEndAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var titleNode = doc.DocumentNode.SelectSingleNode("//title");
                if (titleNode != null)
                {
                    var cleanTitle = Regex.Replace(titleNode.InnerText.ToLower().Trim(), @"[^a-z0-9_]", "_");
                    return cleanTitle;
                }
            }
        }
        catch (Exception)
        {
            // Fail silently, assume no title found
        }
        return null;
    }

    private static void PrintChange(string oldPath, string newPath)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Write(oldPath);
        Console.ResetColor();
        Console.Write(" => ");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine(newPath);

        Console.ResetColor();
    }

    #endregion
    [HttpGet]
    [Route("{**catchAll}")]
    public async Task<IActionResult> Index(string catchAll)
    {
        var contentType = "";

        if (string.IsNullOrWhiteSpace(catchAll))
        {
            catchAll = "index.html";
            contentType = "text/html";
        }

        if (catchAll.EndsWith("manifest.json"))
        {
            contentType = "application/manifest+json";
            var manifestContent = GetDefaultManifest();
            return new ContentResult
            {
                Content = manifestContent,
                ContentType = contentType
            };
        }
        else if (catchAll.EndsWith(".css"))
        {
            contentType = "text/css";
        }
        else if (catchAll.EndsWith(".js"))
        {
            contentType = "text/javascript";
        }
        else if (catchAll.EndsWith(".html"))
        {
            contentType = "text/html";
        }


        var textContent = await GetIndex("Iter9.Html." + catchAll);

        var result = new ContentResult
        {
            Content = textContent,
            ContentType = contentType
        };

        return result;
    }

    public static string canonKey = null;

    [HttpPost]
    [Route("reset_canon")]
    public async Task<IActionResult> ResetCanonMainPage([FromQuery] string key)
    {
        await Task.CompletedTask;

        canonKey = key;

        // TODO: check if key exists, if so, use it, if not, fallback to index
        //canonKey = null;

        return Ok();
    }

    [HttpDelete]
    [Route("nuke")]
    public async Task<IActionResult> NukeAsync(string magicWord = "pleas")
    {
        if ((magicWord ?? "").ToLower().Trim() != "please")
        {
            using var stream = GetType().Assembly.GetManifestResourceStream("Iter9.Resources.please.webp");

            var memoryStream = new MemoryStream();
            stream.CopyTo(memoryStream);
            memoryStream.Position = 0;

            return File(memoryStream, "image/webp");
        }

        var list = await dataStoreService.ListKeysAsync();
        while (list.Any())
        {
            await Task.WhenAll(list.Select(async x => await dataStoreService.DeleteAsync(x)));
            list = await dataStoreService.ListKeysAsync();
        }

        return Ok();
    }

    [HttpDelete]
    [Route("snapshots/{slug}/{revision}")]
    public async Task<IActionResult> DeleteAllAsync(string slug = "iter9_example", string revision = null)
    {
        var keys = await dataStoreService.ListKeysAsync();

        var startKey = string.Join(dataStoreService.PathCharacter, config.DataPath, slug, revision);
        keys = keys.Where(x => x.StartsWith(startKey)).ToArray();

        await Task.WhenAll(keys.Select(async x => await dataStoreService.DeleteAsync(x)));

        return Ok();
    }

    [HttpGet]
    [Route("list")]
    public async Task<IActionResult> ListAsync(string slug, [FromQuery] string revision = null)
    {
        await Task.CompletedTask;

        var slugPath = string.Join(dataStoreService.PathCharacter, config.DataRoot, slug);
        var directoryInfo = new DirectoryInfo(slugPath);

        var files = await dataStoreService.ListKeysAsync();
        if (!string.IsNullOrWhiteSpace(slug))
        {
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{slug}{dataStoreService.PathCharacter}")).ToArray();
        }

        if (string.IsNullOrWhiteSpace(revision))
        {
            var snapshots = files.Where(x => x.Split('/').Length >= 3)
                .Where(x => x.ToLower().EndsWith(".html"))
                .Select(x => string.Join('/', x.Split('/')
                .Skip(1)     // snapshots/...
                .SkipLast(1) // .../index.html
                ))
                //.Select(x => $"{x.Split('/')[1]} ({x.Split('/')[2]})")
                .Distinct()
                .Where(x => !x.Contains("_live"))
                .ToArray();

            snapshots = snapshots
                //.Take(10)
                .ToArray();

            return Ok(snapshots);

            //files = files.Where(x => x.Contains("_live")).ToList();
        }
        else if (revision != "*")
        {
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{revision}{dataStoreService.PathCharacter}")).ToArray();
        }

        ////files = files.Where(x => x.EndsWith("/index.html")).ToList();

        return Ok(files);
    }

    [HttpGet("snapshots/{slug}/{revision}/{resource}")]
    public async Task<IActionResult> GetAsync(string slug = "iter9_example", string revision = null, string resource = "index.html")
    {
        await Task.CompletedTask;

        var key = string.Join(dataStoreService.PathCharacter, config.DataPath, slug, revision, resource);

        var content = await dataStoreService.GetAsync(key);

        string contentType = null;

        if (false) { }
        else if (resource.ToLower().EndsWith(".html")) contentType = "text/html";
        else if (resource.ToLower().EndsWith(".css")) contentType = "text/css";
        else if (resource.ToLower().EndsWith(".js")) contentType = "text/javascript";

        return new ContentResult
        {
            Content = content,
            ContentType = contentType
        };
    }

    [HttpPost("snapshots")]
    public async Task<IActionResult> SnapshotAsync([FromBody] SnapshotModel snapshot)
    {
        ValidateJob(snapshot);
        UpdateAppSlug(snapshot.Slug);

        var revision = DateTime.Now.ToString("yyyy_MM_dd-HH_mm_ss");
        var revisionPath = string.Join(dataStoreService.PathCharacter.ToString(), config.DataPath, snapshot.Slug, revision);

        // Path for the "_live" directory which will be reset with each POST
        var livePath = string.Join(dataStoreService.PathCharacter.ToString(), config.DataPath, snapshot.Slug, "_live");

        foreach (var path in new[] { revisionPath, livePath })
        {
            {
                var file = snapshot.Files.Html.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, path, "index.html");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var file = snapshot.Files.Css.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, path, "style.css");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var file = snapshot.Files.Js.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, path, "script.js");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var fullPath = string.Join(dataStoreService.PathCharacter, path, "metadata.json");
                await dataStoreService.SaveAsync(fullPath, JsonConvert.SerializeObject(new { }));
            }
        }

        var url = string.Join(dataStoreService.PathCharacter, revisionPath, "index.html");

        return Ok(new
        {
            Success = true,
            Message = "Files saved successfully.",
            revision,
            key = url,
            slug = snapshot.Slug,
        });
    }

    [HttpGet]
    [Route("defaults")]
    public async Task<IActionResult> GetDefaultsAsync()
    {
        await Task.CompletedTask;

        var obj = new
        {
            Html = await GetIndex("Iter9.Defaults.default.html"),
            Js = await GetIndex("Iter9.Defaults.default.js"),
            Css = await GetIndex("Iter9.Defaults.default.css")
        };

        return Ok(obj);
    }

    private void ValidateJob(SnapshotModel job)
    {
        // Placeholder for validation logic
    }

    private void UpdateAppSlug(string appSlug)
    {
        // Placeholder for appSlug update logic
    }
    private string GetDefaultManifest()
    {
        var manifest = new
        {
            name = "Iter9",
            short_name = "Iter9",
            start_url = "/api/iter9",
            display = "standalone",
            background_color = "#ffffff",
            theme_color = "#ffffff",
            icons = new[]
            {
                new
                {
                    src = "/icons/icon-192x192.png",
                    type = "image/png",
                    sizes = "192x192"
                },
                new
                {
                    src = "/icons/icon-512x512.png",
                    type = "image/png",
                    sizes = "512x512"
                }
            }
        };

        return JsonConvert.SerializeObject(manifest);
    }
}
