using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var stream = typeof(Iter9Controller).Assembly.GetManifestResourceStream("Iter9.Html.iter9.html");
        stream.Position = 0;
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        ms.Position = 0;
        var textContent = Encoding.UTF8.GetString(ms.ToArray());

        var result = new ContentResult
        {
            Content = textContent,
            ContentType = "text/html"
        };

        return result;
    }

    [HttpGet]
    [Route("list")]
    public async Task<IActionResult> ListAsync(string slug, [FromQuery] string revision = null)
    {
        await Task.CompletedTask;

        var slugPath = string.Join(dataStoreService.PathCharacter, config.DataRoot, slug);
        var directoryInfo = new DirectoryInfo(slugPath);

        var files = await dataStoreService.ListAsync();
        if (!string.IsNullOrWhiteSpace(slug))
        {
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{slug}{dataStoreService.PathCharacter}")).ToList();
        }

        if (string.IsNullOrWhiteSpace(revision))
        {
            files = files.Where(x => x.Contains("_live")).ToList();
        }
        else if (revision != "*")
        {
            files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{revision}{dataStoreService.PathCharacter}")).ToList();
        }

        files = files.Where(x => x.EndsWith("/index.html")).ToList();

        return Ok(files);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetAsync(string slug, [FromQuery] string revision = null)
    {
        await Task.CompletedTask;

        var slugPath = string.Join(dataStoreService.PathCharacter, config.DataRoot, slug);
        var directoryInfo = new DirectoryInfo(slugPath);

        var files = await dataStoreService.ListAsync();
        files = files.Where(x => x.Contains($"{dataStoreService.PathCharacter}{slug}{dataStoreService.PathCharacter}")).ToList();

        if (revision == null)
        {
            files = files.Where(x => x.Contains("_live")).ToList();
        }

        if (!files.Any())
        {
            return NotFound();
        }

        var dict = new Dictionary<string, string>();
        foreach (var file in files)
        {
            dict[file.Split(dataStoreService.PathCharacter).Last()] = await dataStoreService.GetAsync(file);
        }

        var job = new
        {
            Slug = slug,
            Metadata = dict["metadata.json"],
            Files = new
            {
                Html = dict["index.html"],
                Css = dict["style.css"],
                Js = dict["script.js"]
            }
        };

        return Ok(job);
    }

    [HttpPost("snapshot")]
    public async Task<IActionResult> SnapshotAsync([FromBody] SnapshotModel snapshot)
    {
        ValidateJob(snapshot);
        UpdateAppSlug(snapshot.Slug);

        // Construct the revision subdirectory path based on the current timestamp
        var revisionPath = string.Join(dataStoreService.PathCharacter.ToString(), snapshot.Slug, DateTime.Now.ToString("yyyy_MM_dd-HH_mm_ss"));

        // Path for the "_live" directory which will be reset with each POST
        var livePath = string.Join(dataStoreService.PathCharacter.ToString(), snapshot.Slug, "_live");

        foreach (var path in new[] { revisionPath, livePath })
        {
            {
                var file = snapshot.Files.Html.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, config.DataPath, path, "index.html");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var file = snapshot.Files.Css.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, config.DataPath, path, "style.css");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var file = snapshot.Files.Js.Single();
                if (file.Trim() == "") continue;

                var fullPath = string.Join(dataStoreService.PathCharacter, config.DataPath, path, "script.js");
                await dataStoreService.SaveAsync(fullPath, file);
            }

            {
                var fullPath = string.Join(dataStoreService.PathCharacter, config.DataPath, path, "metadata.json");
                await dataStoreService.SaveAsync(fullPath, JsonConvert.SerializeObject(new { }));
            }
        }

        return Ok(new
        {
            Success = true,
            Message = "Files saved successfully.",
            Url = string.Join(dataStoreService.PathCharacter, revisionPath, "index.html"),
            snapshot.Slug,
        });
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