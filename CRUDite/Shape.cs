using System.ComponentModel.DataAnnotations;
// -----------------------
// EF Core Models and DbContext
// -----------------------

public class Shape
{
    [Key]
    public string Name { get; set; } = default!;
    public string Schema { get; set; } = default!; // JSON stored as string
}
