using Newtonsoft.Json;
using System.Text.Json;

public class Menu
{
    public Dictionary<string, List<MenuItem>> Categories { get; set; }

    public static Menu LoadMenu(string filePath)
    {
        string json = File.ReadAllText(filePath);
        var menu = JsonConvert.DeserializeObject<Menu>(json);

        return menu;
    }

}
