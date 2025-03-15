using System.ComponentModel.DataAnnotations;

namespace CRUDite;

public class Shape
{
    [Key]
    public string Name { get; set; } = default!;
    public string Schema { get; set; } = default!; // JSON stored as string
}
