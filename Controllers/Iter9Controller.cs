using Amazon.Auth.AccessControlPolicy;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Text;

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
            bytes = await System.IO.File.ReadAllBytesAsync(@"Z:\code\Iter9\Html\iter9.html");
        }

        var textContent = Encoding.UTF8.GetString(bytes);
        return textContent;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var textContent = await GetIndex("Iter9.Html.iter9.html");

        var result = new ContentResult
        {
            Content = textContent,
            ContentType = "text/html"
        };

        return result;
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
        keys = keys.Where(x => x.StartsWith(startKey)).ToList();

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
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{slug}{dataStoreService.PathCharacter}")).ToList();
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

            snapshots = snapshots.Take(10).ToArray();

            return Ok(snapshots);

            //files = files.Where(x => x.Contains("_live")).ToList();
        }
        else if (revision != "*")
        {
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{revision}{dataStoreService.PathCharacter}")).ToList();
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
}