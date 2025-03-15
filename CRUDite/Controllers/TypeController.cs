using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace CRUDite.Controllers;

[ApiController]
[Route("[controller]")]
public class TypeController : ControllerBase
{
    private readonly AppDbContext appDbContext;

    public TypeController(AppDbContext appDbContext)
    {
        this.appDbContext = appDbContext;
    }

    [HttpPost("register/{name}")]
    public async Task<IActionResult> RegisterShape([FromBody] JsonObject exampleSchema, string name)
    {
        var shape = await appDbContext.Shapes.FindAsync(name);
        if (shape == null)
        {
            shape = new Shape { Name = name, Schema = exampleSchema.ToJsonString() };
            appDbContext.Shapes.Add(shape);

            await appDbContext.SaveChangesAsync();
            return Ok(new { message = $"Shape '{name}' registered." });
        }
        else
        {
            shape.Schema = exampleSchema.ToJsonString();
            appDbContext.Shapes.Update(shape);

            await appDbContext.SaveChangesAsync();
            return Ok(new { message = $"Shape '{name}' updated." });
        }
    }
}
