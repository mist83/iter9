using CRUDite;

namespace CRUDite;

public class DynamoDbLockMiddleware
{
    private readonly RequestDelegate _next;
    private readonly DynamoDbLockManager _lockManager;
    private readonly S3Helper _s3Helper;
    private readonly IServiceScopeFactory _scopeFactory;

    public DynamoDbLockMiddleware(RequestDelegate next, DynamoDbLockManager lockManager, S3Helper s3Helper, IServiceScopeFactory scopeFactory)
    {
        _next = next;
        _lockManager = lockManager;
        _s3Helper = s3Helper;
        _scopeFactory = scopeFactory;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var writeMethods = new[] { "POST", "PUT", "DELETE" };
        bool isWriteOperation = writeMethods.Contains(context.Request.Method, StringComparer.OrdinalIgnoreCase);
        string lambdaId = Guid.NewGuid().ToString();

        // dangerous, can force out-of-sync with SQL
        if (context.Request.Path.ToString().ToLower().StartsWith("/admin/"))
        {
            //isWriteOperation = false;
        }

        if (isWriteOperation)
        {
            if (!await _lockManager.TryAcquireLockAsync(lambdaId))
            {
                context.Response.StatusCode = StatusCodes.Status423Locked;
                await context.Response.WriteAsync("Resource is currently locked.");
                return;
            }
        }

        try
        {
            await _next(context);

            if (isWriteOperation && context.Response.StatusCode < 400)
            {
                await _s3Helper.UploadDatabaseFileAsync(_scopeFactory);
            }
        }
        finally
        {
            if (isWriteOperation)
            {
                await _lockManager.ReleaseLockAsync(lambdaId);
            }
        }
    }
}
