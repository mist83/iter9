using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/records")]
public class RecordController : ControllerBase
{
    private readonly AppDbContext _db;

    public RecordController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("{shapeName}")]
    public async Task<IActionResult> CreateRecord(string shapeName, [FromBody] JsonObject data)
    {
        var shape = await _db.Shapes.FindAsync(shapeName);
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
        _db.Records.Add(record);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRecord), new { shapeName, id = record.Id }, new { id = record.Id });
    }

    [HttpGet("{shapeName}/{id}")]
    public async Task<IActionResult> GetRecord(string shapeName, string id)
    {
        var record = await _db.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        var jsonData = JsonSerializer.Deserialize<JsonObject>(record.Data);
        return Ok(jsonData);
    }

    [HttpPut("{shapeName}/{id}")]
    public async Task<IActionResult> UpdateRecord(string shapeName, string id, [FromBody] JsonObject data)
    {
        var record = await _db.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        record.Data = data.ToJsonString();
        _db.Records.Update(record);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{shapeName}/{id}")]
    public async Task<IActionResult> DeleteRecord(string shapeName, string id)
    {
        var record = await _db.Records.FindAsync(id);
        if (record == null || record.ShapeName != shapeName)
            return NotFound();

        _db.Records.Remove(record);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("{shapeName}")]
    public async Task<IActionResult> QueryRecords(string shapeName, [FromQuery] string? query)
    {
        var records = await _db.Records.Where(r => r.ShapeName == shapeName).ToListAsync();
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
