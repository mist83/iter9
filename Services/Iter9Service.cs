using Amazon.S3;

namespace Iter9.Services;

public partial class Iter9Service
{
    private readonly IAmazonS3 s3Client;
    private string bucketName = Environment.GetEnvironmentVariable("DATA_BUCKET");

    public Iter9Service(IAmazonS3 s3Client)
    {
        if (string.IsNullOrWhiteSpace(bucketName))
        {
            throw new ArgumentException("Environment variable 'DATA_BUCKET' is not set or empty.");
        }

        this.s3Client = s3Client;
    }
}
