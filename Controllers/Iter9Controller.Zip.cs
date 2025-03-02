using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpGet("zip")]
    public async Task<IActionResult> ZipAsync()
    {
        var zipBytes = await iter9Service.ZipAsync();

        var bucketName = Environment.GetEnvironmentVariable("DATA_BUCKET");
        return File(zipBytes, "application/zip", $"{bucketName}.{DateTime.UtcNow:yyyy_MM_dd-HH_mm_ss}.zip");
    }

    [HttpGet("{project}/zip")]
    public async Task<IActionResult> ZipAsync(string project)
    {
        var zipStream = await iter9Service.ZipAsync(project);
        var bucketName = Environment.GetEnvironmentVariable("DATA_BUCKET");
        return File(zipStream, MediaTypeNames.Application.Zip, $"{bucketName}.{project}.{DateTime.UtcNow:yyyy_MM_dd-HH_mm_ss}.zip");
    }

    [HttpGet("{project}/{folder}/zip")]
    public async Task<IActionResult> ZipAsync(string project, string folder)
    {
        var zipStream = await iter9Service.ZipAsync(project, folder);
        var bucketName = Environment.GetEnvironmentVariable("DATA_BUCKET");
        return File(zipStream, MediaTypeNames.Application.Zip, $"{bucketName}.{project}.{folder}.{DateTime.UtcNow:yyyy_MM_dd-HH_mm_ss}.zip");
    }
}
