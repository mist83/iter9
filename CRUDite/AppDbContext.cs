using Microsoft.EntityFrameworkCore;

namespace CRUDite;

public class AppDbContext : DbContext
{
    public DbSet<Shape> Shapes { get; set; } = default!;

    public DbSet<Record> Records { get; set; } = default!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
