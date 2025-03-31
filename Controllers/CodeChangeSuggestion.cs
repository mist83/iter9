
namespace Iter9.Controllers
{
    public class CodeChangeSuggestion
    {
        public ChangeType Type { get; set; }

        // Path to the target file (before rename, if applicable)
        public string FilePath { get; set; }

        // Optional: New path if the file is renamed
        public string? NewFilePath { get; set; }

        // Affected line range for modify/delete, or insertion point for add
        public int? StartLine { get; set; }
        public int? EndLine { get; set; }

        // The proposed replacement or inserted content
        public string? ProposedCode { get; set; }

        // Optional description or reasoning
        public string? Comment { get; set; }
    }
}
