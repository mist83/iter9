using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Nodes;

[ApiController]
[Route("api/shapes")]
public class ShapeController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShapeController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register/{shapeName}")]
    public async Task<IActionResult> RegisterShape(string shapeName, [FromBody] JsonObject schema)
    {
        var shape = await _db.Shapes.FindAsync(shapeName);
        if (shape == null)
        {
            shape = new Shape { Name = shapeName, Schema = schema.ToJsonString() };
            _db.Shapes.Add(shape);
        }
        else
        {
            shape.Schema = schema.ToJsonString();
            _db.Shapes.Update(shape);
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Shape '{shapeName}' registered." });
    }
}
