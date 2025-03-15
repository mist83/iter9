using System.ComponentModel.DataAnnotations;

namespace CRUDite;

public class Record
{
    [Key]
    public string Id { get; set; } = default!;
    public string TypeName { get; set; } = default!;
    public string Data { get; set; } = default!; // JSON stored as string
}
