using Microsoft.AspNetCore.Mvc;
using System.Reflection;

public partial class Iter9Controller : ControllerBase
{
    [HttpGet("plugin")]
    public async Task<IActionResult> GetPluginCodeAsync()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .Single(name => name.Equals("iter9.scrapegoat.dist.scrapegoat.zip", StringComparison.OrdinalIgnoreCase));

        await using var resourceStream = assembly.GetManifestResourceStream(resourceName);
        if (resourceStream == null)
            return NotFound("Embedded resource not found.");

        // Copy to a memory stream that will stay open for the File() method
        var memoryStream = new MemoryStream();
        await resourceStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0; // Reset position before returning

        return File(memoryStream, "application/zip", "plugin.zip");
    }
}

