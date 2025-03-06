using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpPut("{project}")]
    public async Task<IActionResult> UpdateProjectNameAsync(string project, [FromQuery] string newProjectName, [FromQuery] string operation = "move")
    {
        newProjectName = SanitizeString(newProjectName);
        if (newProjectName == project)
        {
            return NoContent();
        }

        if (operation == "copy")
        {
            await iter9Service.CopyAllKeysAsync($"{project}/", $"{newProjectName}/");
        }
        else if (operation == "move")
        {
            await iter9Service.MoveAllKeysAsync($"{project}/", $"{newProjectName}/");
        }
        else
        {
            return BadRequest("Unknown - I only know copy/move");
        }

        return Ok(new
        {
            Operation = operation,
            OldName = $"{project}/",
            NewName = $"{newProjectName}/",
        });
    }

    [HttpPut("{project}/{folder}")]
    public async Task<IActionResult> UpdateFolderNameAsync(string project, string folder, [FromQuery] string newFolderName, [FromQuery] string operation = "move")
    {
        newFolderName = SanitizeString(newFolderName);
        if (newFolderName == folder)
        {
            return NoContent();
        }

        if (operation == "copy")
        {
            await iter9Service.CopyAllKeysAsync($"{project}/{folder}/", $"{project}/{newFolderName}/");
        }
        else if (operation == "move")
        {
            await iter9Service.MoveAllKeysAsync($"{project}/{folder}/", $"{project}/{newFolderName}/");
        }
        else
        {
            return BadRequest("Unknown - I only know copy/move");
        }

        return Ok(new
        {
            Operation = operation,
            OldName = $"{project}/{folder}/",
            NewName = $"{project}/{newFolderName}/",
        });
    }

    [HttpPut("{project}/{folder}/{**resource}")]
    public async Task<IActionResult> MoveOrCopyColderAsync(string project, string folder, string resource, [FromQuery] string newFileName, [FromQuery] string operation = "move")
    {
        if (newFileName == resource)
        {
            return NoContent();
        }

        var split = newFileName.Split(".");
        var extension = "";

        if (split.Length > 1)
        {
            extension = "." + split.Last();
            newFileName = string.Join(".", split.SkipLast(1));
        }

        newFileName = SanitizeString(newFileName);
        if (operation == "copy")
        {
            await iter9Service.CopyAllKeysAsync($"{project}/{folder}/{resource}", $"{project}/{folder}/{newFileName}{extension}");
        }
        else if (operation == "move")
        {
            await iter9Service.MoveAllKeysAsync($"{project}/{folder}/{resource}", $"{project}/{folder}/{newFileName}{extension}");
        }

        return Ok(new
        {
            Name = $"{project}/{newFileName}/"
        });
    }
}
