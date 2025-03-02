using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpDelete("{project}/{folder}/{**resource}")]
    public async Task<IActionResult> DeleteFileAsync(string project, string folder, string resource)
    {
        var fullKey = $"{project}/{folder}/{resource}";
        await iter9Service.DeleteAsync(fullKey);

        return Ok();
    }
}
