using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Filters;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

[ApiController]
[Route("[controller]")]
public class RecordController : ControllerBase
{
    private readonly AppDbContext appDbContext;

    public RecordController(AppDbContext appDbContext)
    {
        this.appDbContext = appDbContext;
    }

    [HttpPost("{shapeName}")]
    [SwaggerRequestExample(typeof(JsonObject), typeof(ExampleShape))]
    public async Task<IActionResult> CreateRecord(string shapeName, [FromBody] JsonObject data)
    {
        var shape = await appDbContext.Shapes.FindAsync(shapeName);
        if (shape == null)
            return BadRequest("Shape not registered.");

        var schema = JsonSerializer.Deserialize<JsonObject>(shape.Schema);
        foreach (var field in schema)
        {
            if (!data.ContainsKey(field.Key))
                return BadRequest($"Missing field '{field.Key}'.");
        }

        var record = new Record
        {
            Id = Guid.NewGuid().ToString(),
            ShapeName = shapeName,
            Data = data.ToJsonString()
        };
        appDbContext.Records.Add(record);
        await appDbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRecord), new { shapeName, id = record.Id }, new { id = record.Id });
    }

    [HttpGet("{shapeName}/{id}")]
    public async Task<IActionResult> GetRecord(string shapeName, string id)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        var jsonData = JsonSerializer.Deserialize<JsonObject>(record.Data);
        return Ok(jsonData);
    }

    [HttpPut("{shapeName}/{id}")]
    public async Task<IActionResult> UpdateRecord(string shapeName, string id, [FromBody] JsonObject data)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        record.Data = data.ToJsonString();
        appDbContext.Records.Update(record);
        await appDbContext.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{shapeName}/{id}")]
    public async Task<IActionResult> DeleteRecord(string shapeName, string id)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        appDbContext.Records.Remove(record);
        await appDbContext.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("{shapeName}")]
    public async Task<IActionResult> QueryRecords(string shapeName, [FromQuery] string? query)
    {
        var records = await appDbContext.Records.Where(r => r.ShapeName == shapeName).ToListAsync();
        var results = new List<JsonObject>();

        foreach (var record in records)
        {
            var jsonData = JsonSerializer.Deserialize<JsonObject>(record.Data);
            if (!string.IsNullOrEmpty(query) && Regex.IsMatch(record.Data, query))
                results.Add(jsonData);
            else if (string.IsNullOrEmpty(query))
                results.Add(jsonData);
        }

        return Ok(results);
    }
}
