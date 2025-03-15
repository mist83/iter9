using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Any;
using System.Text.Json.Nodes;

public class DynamicExampleFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Generate a random example name
        var randomExample1 = GetRandomExample();
        var randomExample = randomExample1.Item2;

        // Ensure the "name" parameter gets the generated example
        var nameParameter = operation.Parameters?.FirstOrDefault(p => p.Name == "name");
        if (nameParameter != null)
        {
            nameParameter.Example = new OpenApiString(randomExample1.Item1);
        }

        // Modify the request body example to match the random item
        var requestBody = operation.RequestBody;
        if (requestBody != null && requestBody.Content.ContainsKey("application/json"))
        {
            requestBody.Content["application/json"].Example = new OpenApiObject
            {
                ["id"] = new OpenApiString(randomExample.Id),
                ["name"] = new OpenApiString(randomExample.Name),
                ["description"] = new OpenApiString(randomExample.Description),
                ["price"] = new OpenApiDouble(randomExample.Price)
            };
        }
    }

    private (string, MenuItem) GetRandomExample()
    {
        // Usage Example:
        Menu menu = Menu.LoadMenu(@"Z:\code\Iter9\CRUDite\Resources\examples.json");

        // Example Output:
        foreach (var category in menu.Categories)
        {
            Console.WriteLine($"Category: {category.Key}");
            foreach (var item in category.Value)
            {
                Console.WriteLine($"- {item.Name}: {item.Description} (${item.Price})");
            }
        }

        return (menu, menu.Categories.OrderBy(x => Guid.NewGuid()).First().Value.OrderBy(x => Guid.NewGuid()).First());
    }
}
