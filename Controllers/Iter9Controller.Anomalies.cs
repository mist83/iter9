using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpGet("anomalies")]
    public async Task<IActionResult> GetAnomalousFileNamesAsync()
    {
        var anomalies = await iter9Service.GetAnomalousFileNamesAsync();
        var dict = anomalies.ToDictionary(x => x, x => x);

        return Ok(dict);
    }

    [HttpPost("anomalies")]
    public async Task<IActionResult> RenameAnomalousFileNamesAsync([FromBody] Dictionary<string, string> renameMapping)
    {
        var renamed = await iter9Service.RenameAnomalousFilesAsync(renameMapping);
        return Ok(renamed);
    }

    private static string SanitizeString(string input)
    {
        string output = string.Concat(input.Select(c => char.IsLetterOrDigit(c) ? char.ToLower(c) : '_')).ToLower();

        while (output.Contains("__"))
        {
            output = output.Replace("__", "_");
        }

        output = output.Trim('_');

        return output;
    }
}
