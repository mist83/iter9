using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Shape> Shapes { get; set; } = default!;
    public DbSet<Record> Records { get; set; } = default!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}
