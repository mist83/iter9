using System.Net;
using System.Text.Json;

namespace Iter9.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context); // Proceed to the next middleware or controller
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = new
        {
            Error = exception.Message,
            StackTrace = exception.StackTrace,
            Type = exception.GetType().Name,
            Path = context.Request.Path,
            Method = context.Request.Method,
            Query = context.Request.QueryString.ToString()
        };

        var result = JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        return context.Response.WriteAsync(result);
    }
}