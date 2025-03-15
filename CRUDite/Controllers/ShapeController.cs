using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Nodes;

[ApiController]
[Route("[controller]")]
public class ShapeController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShapeController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register/{shapeName}")]
    public async Task<IActionResult> RegisterShape( [FromBody] JsonObject exampleSchema, string shapeName = "product")
    {
        var shape = await _db.Shapes.FindAsync(shapeName);
        if (shape == null)
        {
            shape = new Shape { Name = shapeName, Schema = exampleSchema.ToJsonString() };
            _db.Shapes.Add(shape);

            await _db.SaveChangesAsync();
            return Ok(new { message = $"Shape '{shapeName}' registered." });
        }
        else
        {
            shape.Schema = exampleSchema.ToJsonString();
            _db.Shapes.Update(shape);

            await _db.SaveChangesAsync();
            return Ok(new { message = $"Shape '{shapeName}' updated." });
        }
    }
}
