using System.Xml.Linq;

namespace Peeper.Db;

public class Peep
{
    public string Id { get; set; }

    public Chat Chat { get; set; }

    public DateTime Date { get; set; }

    public int Order { get; set; }

    public string Type { get; set; }

    public string Content { get; set; }
}

public class PeepModel
{
    public string Id { get; set; }

    public Guid ChatId => Guid.Parse(Id.Split('_').First());

    public DateTime Date { get; set; }

    public int Order { get; set; }

    public string Type { get; set; }

    public string Content { get; set; }
}


public class Chat
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public List<Peep> Peeps { get; set; }

    public List<ChatTag> ChatTags { get; set; } = new List<ChatTag>();

    public override string ToString()
    {
        return Name;
    }
}

public class PeepTag
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public override string ToString()
    {
        return Name;
    }
}

public class ChatTag
{
    public Guid Id { get; set; }

    //public Guid ChatId { get; set; }

    public Chat Chat { get; set; }

    //public Guid TagId { get; set; }

    public PeepTag Tag { get; set; }


    public override string ToString()
    {
        return $"{Chat} => {Tag}";
    }
}
