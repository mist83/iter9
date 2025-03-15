using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class DynamoDbLockManager
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName = "DatabaseLock";
    private readonly string _lockId = "sqlite-db-lock";

    public DynamoDbLockManager(IAmazonDynamoDB dynamoDb)
    {
        _dynamoDb = dynamoDb;
    }

    /// <summary>
    /// Ensures the DynamoDB table exists. Creates it if missing.
    /// </summary>
    public async Task EnsureTableExistsAsync()
    {
        try
        {
            var response = await _dynamoDb.DescribeTableAsync(_tableName);
            Console.WriteLine($"DynamoDB table '{_tableName}' already exists.");
        }
        catch (ResourceNotFoundException)
        {
            Console.WriteLine($"DynamoDB table '{_tableName}' not found. Creating it now...");

            var request = new CreateTableRequest
            {
                TableName = _tableName,
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition("LockID", ScalarAttributeType.S)
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement("LockID", KeyType.HASH)
                },
                ProvisionedThroughput = new ProvisionedThroughput(5, 5) // Low since it's just a lock
            };

            await _dynamoDb.CreateTableAsync(request);
            Console.WriteLine($"DynamoDB table '{_tableName}' created successfully.");

            // Wait for table to be active
            await WaitForTableToBeActive();
        }
    }

    private async Task WaitForTableToBeActive()
    {
        Console.WriteLine($"Waiting for DynamoDB table '{_tableName}' to become active...");

        while (true)
        {
            var response = await _dynamoDb.DescribeTableAsync(_tableName);
            if (response.Table.TableStatus == "ACTIVE")
            {
                Console.WriteLine($"DynamoDB table '{_tableName}' is now active.");
                break;
            }

            await Task.Delay(1000);
        }
    }

    /// <summary>
    /// Attempts to acquire a lock for writing to the database.
    /// </summary>
    public async Task<bool> TryAcquireLockAsync(string lambdaId, int lockTimeoutSeconds = 10)
    {
        var now = DateTime.UtcNow;
        var expiry = now.AddSeconds(lockTimeoutSeconds);

        var request = new PutItemRequest
        {
            TableName = _tableName,
            Item = new Dictionary<string, AttributeValue>
            {
                { "LockID", new AttributeValue { S = _lockId } },
                { "LockedBy", new AttributeValue { S = lambdaId } },
                { "LockExpiresAt", new AttributeValue { S = expiry.ToString("o") } }
            },
            ConditionExpression = "attribute_not_exists(LockID) OR LockExpiresAt < :now",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":now", new AttributeValue { S = now.ToString("o") } }
            }
        };

        try
        {
            await _dynamoDb.PutItemAsync(request);
            return true;
        }
        catch (ConditionalCheckFailedException)
        {
            return false;
        }
    }

    /// <summary>
    /// Releases the lock once the write operation is complete.
    /// </summary>
    public async Task ReleaseLockAsync(string lambdaId)
    {
        var request = new DeleteItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue> { { "LockID", new AttributeValue { S = _lockId } } },
            ConditionExpression = "LockedBy = :lambdaId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":lambdaId", new AttributeValue { S = lambdaId } }
            }
        };

        try
        {
            await _dynamoDb.DeleteItemAsync(request);
        }
        catch (ConditionalCheckFailedException)
        {
            // The lock was not held by this Lambda, ignore.
        }
    }
}
