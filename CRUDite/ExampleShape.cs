using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Filters;
using System.Text.Json.Nodes;

public class ExampleShape : IExamplesProvider<JsonObject>
{
    public JsonObject GetExamples()
    {
        var items = new List<object>();
        items.Add(new { id = "brain_biscuits", name = "Brain Biscuits", description = "Crunchy snacks infused with the knowledge of the ancients. Tastes like wisdom!", price = 4.99 });
        items.Add(new { id = "ghoul_granola", name = "Ghoul Granola", description = "A spooky mix of oats, dried blood oranges, and eerie energy.", price = 5.49 });
        items.Add(new { id = "phantom_puffs", name = "Phantom Puffs", description = "So light and airy, they disappear before you finish chewing.", price = 3.99 });
        items.Add(new { id = "werewolf_wheaties", name = "Werewolf Wheaties", description = "Guaranteed to keep you full until the next full moon.", price = 6.66 });
        items.Add(new { id = "ectoplasm_eggos", name = "Ectoplasm Eggos", description = "These waffles glow in the dark! Perfect for midnight snacks.", price = 7.77 });
        var item = items.OrderBy(x => Guid.NewGuid()).First();

        var json = JsonConvert.SerializeObject(item);
        var jsonObject = JsonNode.Parse(json).AsObject();

        return jsonObject;
    }
}
