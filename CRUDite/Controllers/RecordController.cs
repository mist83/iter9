using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Filters;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace CRUDite.Controllers;

[ApiController]
[Route("[controller]")]
public class RecordController : ControllerBase
{
    private readonly AppDbContext appDbContext;

    public RecordController(AppDbContext appDbContext)
    {
        this.appDbContext = appDbContext;
    }

    [HttpPost("{typeName}")]
    [SwaggerRequestExample(typeof(JsonObject), typeof(ExampleShapeProvider))]
    public async Task<IActionResult> CreateRecord(string typeName, [FromBody] JsonObject data)
    {
        var shape = await appDbContext.Shapes.FindAsync(typeName);
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
            TypeName = typeName,
            Data = data.ToJsonString()
        };
        appDbContext.Records.Add(record);
        await appDbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRecord), new { typeName, id = record.Id }, new { id = record.Id });
    }

    [HttpGet("{typeName}/{id}")]
    public async Task<IActionResult> GetRecord(string typeName, string id)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.TypeName != typeName)
            return NotFound();

        var jsonData = JsonSerializer.Deserialize<JsonObject>(record.Data);
        return Ok(jsonData);
    }

    [HttpPut("{typeName}/{id}")]
    public async Task<IActionResult> UpdateRecord(string typeName, string id, [FromBody] JsonObject data)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.TypeName != typeName)
            return NotFound();

        record.Data = data.ToJsonString();
        appDbContext.Records.Update(record);
        await appDbContext.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{typeName}/{id}")]
    public async Task<IActionResult> DeleteRecord(string typeName, string id)
    {
        var record = await appDbContext.Records.FindAsync(id);
        if (record == null || record.TypeName != typeName)
            return NotFound();

        appDbContext.Records.Remove(record);
        await appDbContext.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("{typeName}")]
    public async Task<IActionResult> QueryRecords(string typeName, [FromQuery] string query)
    {
        var records = await appDbContext.Records.Where(r => r.TypeName == typeName).ToListAsync();
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
