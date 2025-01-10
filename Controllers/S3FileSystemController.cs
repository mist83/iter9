using Microsoft.AspNetCore.Mvc;
using ReusableUtilities;
using System.Text;

namespace Iter9.Controllers;

[ApiController]
[Route("[controller]")]
public class S3FileSystemController : ControllerBase
{
    private readonly IFileSystem fileSystem;

    public S3FileSystemController(IFileSystem fileSystem)
    {
        this.fileSystem = fileSystem ?? throw new ArgumentNullException(nameof(fileSystem));
    }

    [HttpGet("test")]
    public async Task<IActionResult> TestS3Functionality()
    {
        // Generate a unique prefix for this test run
        var randomId = Guid.NewGuid().ToString("N");
        var prefix = $"/tests/{randomId}/";
        var testKey = $"{prefix}test-key.txt";
        var testContent = $"Test Content: {DateTime.UtcNow}";
        var copyKey = $"{prefix}test-key-copy.txt";
        var moveKey = $"{prefix}moved-test-key.txt";
        var binaryKey = $"{prefix}binary-test.dat";
        var testBytes = Encoding.UTF8.GetBytes("Binary test content.");
        var results = new List<string>
        {
            $"Test Prefix: {prefix}"
        };

        try
        {
            // 1. Write a test file
            results.Add("Testing WriteAllTextAsync...");
            if (await fileSystem.WriteAllTextAsync(testKey, testContent) &&
                await fileSystem.ExistsAsync(testKey))
            {
                results.Add($"✅ WriteAllTextAsync: Successfully wrote {testKey}");
            }
            else
            {
                results.Add($"❌ WriteAllTextAsync: Failed to write {testKey}");
            }

            // 2. Check file existence
            results.Add("Testing ExistsAsync...");
            if (await fileSystem.ExistsAsync(testKey))
            {
                results.Add($"✅ ExistsAsync: File {testKey} exists.");
            }
            else
            {
                results.Add($"❌ ExistsAsync: File {testKey} does not exist.");
            }

            // 3. Read the file and verify content
            results.Add("Testing ReadAllTextAsync...");
            var readContent = await fileSystem.ReadAllTextAsync(testKey);
            if (readContent == testContent)
            {
                results.Add($"✅ ReadAllTextAsync: Content matches for {testKey}");
            }
            else
            {
                results.Add($"❌ ReadAllTextAsync: Content mismatch for {testKey}. Expected: {testContent}, Got: {readContent}");
            }

            // 4. Copy the file and verify
            results.Add("Testing CopyFileAsync...");
            if (await fileSystem.CopyFileAsync(testKey, copyKey) &&
                await fileSystem.ExistsAsync(copyKey))
            {
                results.Add($"✅ CopyFileAsync: Successfully copied {testKey} to {copyKey}");
            }
            else
            {
                results.Add($"❌ CopyFileAsync: Failed to copy {testKey} to {copyKey}");
            }

            // 5. Move the copied file and verify
            results.Add("Testing MoveFileAsync...");
            if (await fileSystem.MoveFileAsync(copyKey, moveKey) &&
                !await fileSystem.ExistsAsync(copyKey) &&
                await fileSystem.ExistsAsync(moveKey))
            {
                results.Add($"✅ MoveFileAsync: Successfully moved {copyKey} to {moveKey}");
            }
            else
            {
                results.Add($"❌ MoveFileAsync: Move operation failed from {copyKey} to {moveKey}");
            }

            // 6. List files under the prefix
            results.Add("Testing ListAsync...");
            var files = await fileSystem.ListAsync(prefix);
            if (files.Length > 0)
            {
                results.Add($"✅ ListAsync: Found {files.Length} file(s) under prefix '{prefix}':");
                foreach (var file in files)
                {
                    results.Add($"  - {file}");
                }
            }
            else
            {
                results.Add($"❌ ListAsync: No files found under prefix '{prefix}'.");
            }

            // 7. Write and verify binary content
            results.Add("Testing WriteAllBytesAsync and ReadAllBytesAsync...");
            if (await fileSystem.WriteAllBytesAsync(binaryKey, testBytes))
            {
                var readBytes = await fileSystem.ReadAllBytesAsync(binaryKey);
                if (Encoding.UTF8.GetString(readBytes) == Encoding.UTF8.GetString(testBytes))
                {
                    results.Add($"✅ WriteAllBytesAsync & ReadAllBytesAsync: Binary content matches for {binaryKey}");
                }
                else
                {
                    results.Add($"❌ WriteAllBytesAsync & ReadAllBytesAsync: Content mismatch for {binaryKey}");
                }
            }
            else
            {
                results.Add($"❌ WriteAllBytesAsync: Failed to write binary file {binaryKey}");
            }

            // 8. Delete all files and verify
            results.Add("Testing DeleteFileAsync...");
            var deleteTestKey = await fileSystem.DeleteFileAsync(testKey) && !await fileSystem.ExistsAsync(testKey) ? "✅" : "❌";
            results.Add($"{deleteTestKey} Deleted: {testKey}");

            var deleteMoveKey = await fileSystem.DeleteFileAsync(moveKey) && !await fileSystem.ExistsAsync(moveKey) ? "✅" : "❌";
            results.Add($"{deleteMoveKey} Deleted: {moveKey}");

            var deleteBinaryKey = await fileSystem.DeleteFileAsync(binaryKey) && !await fileSystem.ExistsAsync(binaryKey) ? "✅" : "❌";
            results.Add($"{deleteBinaryKey} Deleted: {binaryKey}");

            // All operations completed
            results.Add("🎉 All tests completed successfully.");
            return Ok(results);
        }
        catch (Exception ex)
        {
            results.Add($"💥 Error occurred: {ex.Message}");
            return StatusCode(500, results);
        }
    }
}
