using Amazon.S3;
using Amazon.S3.Model;

namespace Scandy.API.Services
{
    public class R2Service
    {
        private readonly IAmazonS3 _client;
        private readonly string _bucketName;

        public R2Service(IConfiguration config)
        {
            var accessKey = config["R2:AccessKey"];
            var secretKey = config["R2:SecretKey"];
            var serviceUrl = config["R2:ServiceUrl"];
            _bucketName = config["R2:BucketName"];

            _client = new AmazonS3Client(accessKey, secretKey, new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true
            });
        }

        // ✅ Upload with user folder + clean filename
        public async Task<string> UploadAsync(IFormFile file, string userId)
        {
            var fileName = $"{Guid.NewGuid()}.mp4"; // clean & secure
            var filePath = $"{userId}/{fileName}";  // important

            using var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = filePath,
                InputStream = stream,
                ContentType = file.ContentType,
                DisablePayloadSigning = true
            };

            await _client.PutObjectAsync(request);

            return filePath; // ✅ return full path (store in DB)
        }

        // 🔐 Generate signed URL (core change)
        public string GetSignedUrl(string filePath)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = filePath,
                Expires = DateTime.UtcNow.AddMinutes(10), // adjust if needed
                Verb = HttpVerb.GET
            };

            return _client.GetPreSignedURL(request);
        }
    }
}