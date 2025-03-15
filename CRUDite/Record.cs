using System.ComponentModel.DataAnnotations;

public class Record
{
    [Key]
    public string Id { get; set; } = default!;
    public string ShapeName { get; set; } = default!;
    public string Data { get; set; } = default!; // JSON stored as string
}
