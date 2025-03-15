using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Filters;
using System.Text.Json.Nodes;

public class ExampleShape : IExamplesProvider<JsonObject>
{
    public JsonObject GetExamples()
    {
        var json1 = JsonConvert.SerializeObject(new { id = "brain_biscuits", name = "Brain Biscuits", description = "Crunchy snacks infused with the knowledge of the ancients. Tastes like wisdom!", price = 4.99 });
        var json2 = JsonConvert.SerializeObject(new { id = "ghoul_granola", name = "Ghoul Granola", description = "A spooky mix of oats, dried blood oranges, and eerie energy.", price = 5.49 });
        var json3 = JsonConvert.SerializeObject(new { id = "phantom_puffs", name = "Phantom Puffs", description = "So light and airy, they disappear before you finish chewing.", price = 3.99 });
        var json4 = JsonConvert.SerializeObject(new { id = "werewolf_wheaties", name = "Werewolf Wheaties", description = "Guaranteed to keep you full until the next full moon.", price = 6.66 });
        var json5 = JsonConvert.SerializeObject(new { id = "ectoplasm_eggos", name = "Ectoplasm Eggos", description = "These waffles glow in the dark! Perfect for midnight snacks.", price = 7.77 });

        var json = new[] { json1, json2, json3, json3, json5 }.OrderBy(x => Guid.NewGuid()).First();
        var jsonObject = JsonNode.Parse(json).AsObject();

        return jsonObject;
    }
}
