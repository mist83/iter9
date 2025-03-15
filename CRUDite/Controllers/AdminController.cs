using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var shapeCount = await _db.Shapes.CountAsync();
        var recordCount = await _db.Records.CountAsync();
        var dbFileInfo = new System.IO.FileInfo("shapes.db");
        var dbSizeKB = dbFileInfo.Exists ? dbFileInfo.Length / 1024 : 0;

        return Ok(new { totalShapes = shapeCount, totalRecords = recordCount, databaseSizeKB = dbSizeKB });
    }

    [HttpPost("sql")]
    public async Task<IActionResult> ExecuteSql([FromBody] string sql)
    {
        if (sql.Trim().ToLower().StartsWith("select"))
        {
            var conn = _db.Database.GetDbConnection();
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            var results = new List<Dictionary<string, object>>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                    row[reader.GetName(i)] = reader.GetValue(i);
                results.Add(row);
            }
            return Ok(results);
        }
        else
        {
            var affectedRows = await _db.Database.ExecuteSqlRawAsync(sql);
            return Ok(new { message = "SQL executed.", affectedRows });
        }
    }

    [HttpDelete("purge/{shapeName}")]
    public async Task<IActionResult> PurgeShape(string shapeName)
    {
        var recordsToDelete = _db.Records.Where(r => r.ShapeName == shapeName);
        _db.Records.RemoveRange(recordsToDelete);
        var deleted = await _db.SaveChangesAsync();
        return Ok(new { message = $"Purged {deleted} records for '{shapeName}'." });
    }

    [HttpDelete("cleanup")]
    public async Task<IActionResult> CleanupShapes()
    {
        var usedShapeNames = await _db.Records.Select(r => r.ShapeName).Distinct().ToListAsync();
        var shapesToDelete = _db.Shapes.Where(s => !usedShapeNames.Contains(s.Name));
        _db.Shapes.RemoveRange(shapesToDelete);
        var deleted = await _db.SaveChangesAsync();
        return Ok(new { message = $"Removed {deleted} unused shapes." });
    }

    [HttpPost("optimize")]
    public async Task<IActionResult> OptimizeDatabase()
    {
        await _db.Database.ExecuteSqlRawAsync("VACUUM;");
        return Ok(new { message = "Database optimized." });
    }
}
