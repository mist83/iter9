using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext appDbContext;

    public AdminController(AppDbContext appDbContext)
    {
        this.appDbContext = appDbContext;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var shapeCount = await appDbContext.Shapes.CountAsync();
        var recordCount = await appDbContext.Records.CountAsync();
        var dbFileInfo = new System.IO.FileInfo("crudite.db");
        var dbSizeKB = dbFileInfo.Exists ? dbFileInfo.Length / 1024 : 0;

        return Ok(new { totalShapes = shapeCount, totalRecords = recordCount, databaseSizeKB = dbSizeKB });
    }

    [HttpPost("sql")]
    public async Task<IActionResult> ExecuteSql([FromBody] string sql="select * from Shapes")
    {
        if (sql.Trim().ToLower().StartsWith("select"))
        {
            var conn = appDbContext.Database.GetDbConnection();
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
            var affectedRows = await appDbContext.Database.ExecuteSqlRawAsync(sql);
            return Ok(new { message = "SQL executed.", affectedRows });
        }
    }

    [HttpDelete("purge/{shapeName}")]
    public async Task<IActionResult> PurgeShape(string shapeName)
    {
        var recordsToDelete = appDbContext.Records.Where(r => r.ShapeName == shapeName);
        appDbContext.Records.RemoveRange(recordsToDelete);
        var deleted = await appDbContext.SaveChangesAsync();
        return Ok(new { message = $"Purged {deleted} records for '{shapeName}'." });
    }

    [HttpDelete("cleanup")]
    public async Task<IActionResult> CleanupShapes()
    {
        var usedShapeNames = await appDbContext.Records.Select(r => r.ShapeName).Distinct().ToListAsync();
        var shapesToDelete = appDbContext.Shapes.Where(s => !usedShapeNames.Contains(s.Name));
        appDbContext.Shapes.RemoveRange(shapesToDelete);
        var deleted = await appDbContext.SaveChangesAsync();
        return Ok(new { message = $"Removed {deleted} unused shapes." });
    }

    [HttpPost("optimize")]
    public async Task<IActionResult> OptimizeDatabase()
    {
        await appDbContext.Database.ExecuteSqlRawAsync("VACUUM;");
        return Ok(new { message = "Database optimized." });
    }
}
