using Iter9.Model;
using Microsoft.AspNetCore.Mvc;

namespace Iter9.Controllers;

public partial class Iter9Controller
{
    [HttpPost("{project}/{folder}")]
    public async Task<IActionResult> CreateAsync(string project, string folder, [FromBody] FileDetail fileDetail = null)
    {
        var result = await iter9Service.ScoopAsync(project, folder, fileDetail);

        return Ok(new
        {
            Url = result
        });
    }
}
