using Iter9.Model;
using Microsoft.AspNetCore.Mvc;
using Peeper.Db;
using System;

namespace Iter9.Controllers;

public partial class Iter9Controller
{

    [HttpPost]
    public async Task<ActionResult<string>> CreateOrUpdatePeepAsync([FromBody] PeepModel peep)
    {
        var id = await iter9Service.CreateOrUpdatePeepAsync(peep);
        return Ok(id);
    }
}
