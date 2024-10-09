namespace Iter9;

public interface IDataStoreService
{
    char PathCharacter { get; }

    Task<string> SaveAsync(string key, string text);

    Task<string> GetAsync(string key);

    Task<string> SaveAsync(string key, byte[] data);

    Task<byte[]> GetAsBinaryAsync(string key);

    Task<List<string>> ListAsync(string substring = "");
}
