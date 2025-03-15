using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class DynamicNameParameterFilter : IParameterFilter
{
    public void Apply(OpenApiParameter parameter, ParameterFilterContext context)
    {
        if (parameter.Name == "name") // Target the "name" parameter
        {
            parameter.Example = new Microsoft.OpenApi.Any.OpenApiString(GetRandomExampleName());
        }
    }

    private string GetRandomExampleName()
    {
        var examples = new[] { "soup", "pancakes", "ghost_peppers", "shadow_snacks", "ectoplasm_eggos" };
        return examples[new Random().Next(examples.Length)];
    }
}
