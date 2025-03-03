using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpGet]
    public async Task<IActionResult> ReadProjectNamesAsync()
    {
        var result = await iter9Service.GetProjectNamesAsync();
        return Ok(result);
    }

    [HttpGet("{project}")]
    public async Task<IActionResult> ReadProjectAsync(string project)
    {
        var details = await iter9Service.GetProjectDetailsAsync(project);

        var resources = details.Folders.Select(x => x.Name).ToArray();

        var projects = (await iter9Service.GetProjectNamesAsync()).ToList();
        var index = projects.IndexOf(project);

        return Ok(new
        {
            Name = project,
            Previous = index > 0 ? projects[index - 1] : null,
            Next = index < projects.Count - 1 ? projects[index + 1] : null,
            details.Folders
        });
    }

    [HttpGet("{project}/folders")]
    public async Task<IActionResult> ReadProjectFoldersAsync(string project)
    {
        var details = await iter9Service.GetProjectDetailsAsync(project);

        var resources = details.Folders.Select(x => x.Name).ToArray();
        return Ok(resources);
    }

    [HttpGet("{project}/{folder}")]
    public async Task<IActionResult> ReadProjectFolderAsync(string project, string folder)
    {
        var projectDetails = await iter9Service.GetProjectDetailsAsync(project);
        var fileDetails = projectDetails.Folders.Single(x => x.Name == folder).Files;

        return Ok(fileDetails);
    }

    [HttpGet("{project}/{folder}/{**fileName}")]
    public async Task<IActionResult> ReadFileAsync(string project = "*", string folder = "*", string fileName = "*")
    {
        var file = await iter9Service.GetFileAsync(project, folder, fileName);

        if (file == null)
        {
            return BadRequest();
        }

        Response.Headers.Add("X-Project", project);
        Response.Headers.Add("X-Folder", folder);
        Response.Headers.Add("X-Resource", file.Name);

        return new ContentResult
        {
            ContentType = file.ContentType,
            Content = file.Content
        };
    }
}
