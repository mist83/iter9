using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

[ApiController]
[Route("[controller]")]
public class ShapeController : ControllerBase
{
    private readonly AppDbContext appDbContext;

    public ShapeController(AppDbContext appDbContext)
    {
        this.appDbContext = appDbContext;
    }

    [HttpPost("register/{shapeName}")]
    public async Task<IActionResult> RegisterShape( [FromBody] JsonObject exampleSchema, string shapeName = "product")
    {
        var shape = await appDbContext.Shapes.FindAsync(shapeName);
        if (shape == null)
        {
            shape = new Shape { Name = shapeName, Schema = exampleSchema.ToJsonString() };
            appDbContext.Shapes.Add(shape);

            await appDbContext.SaveChangesAsync();
            return Ok(new { message = $"Shape '{shapeName}' registered." });
        }
        else
        {
            shape.Schema = exampleSchema.ToJsonString();
            appDbContext.Shapes.Update(shape);

            await appDbContext.SaveChangesAsync();
            return Ok(new { message = $"Shape '{shapeName}' updated." });
        }
    }
}
