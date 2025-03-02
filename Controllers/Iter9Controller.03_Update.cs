using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpPut("{project}/{folder}")]
    public async Task<IActionResult> UpdateFolderNameAsync(string project, string folder, [FromQuery] string newFolder, [FromQuery] bool keep = false)
    {
        newFolder = SanitizeString(newFolder);
        if (newFolder == folder)
        {
            return NoContent();
        }

        if (keep)
        {
            await iter9Service.CopyAllKeysAsync($"{project}/{folder}/", $"{project}/{newFolder}/");
        }
        else
        {
            await iter9Service.MoveAllKeysAsync($"{project}/{folder}/", $"{project}/{newFolder}/");
        }

        return Ok(new
        {
            OldName = $"{project}/{folder}/",
            NewName = $"{project}/{newFolder}/",
            Operation = keep ? "Copy" : "Move"
        });
    }

    [HttpPut("{project}/{folder}/{**resource}")]
    public async Task<IActionResult> MoveOrCopyColderAsync(string project, string folder, string resource, [FromQuery] string newName, [FromQuery] string operation = "move")
    {
        if (newName == resource)
        {
            return NoContent();
        }

        var split = newName.Split(".");
        var extension = "";

        if (split.Length > 1)
        {
            extension = "." + split.Last();
            newName = string.Join(".", split.SkipLast(1));
        }

        newName = SanitizeString(newName);
        if (operation == "copy")
        {
            await iter9Service.CopyAllKeysAsync($"{project}/{folder}/{resource}", $"{project}/{folder}/{newName}{extension}");
        }
        else if (operation == "move")
        {
            await iter9Service.MoveAllKeysAsync($"{project}/{folder}/{resource}", $"{project}/{folder}/{newName}{extension}");
        }

        return Ok(new
        {
            Name = $"{project}/{newName}/"
        });
    }
}
