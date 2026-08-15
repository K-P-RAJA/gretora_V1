#!/usr/bin/env dotnet-script
// R2 Metadata Fixer — One-Time Script
// Fixes all existing videos in R2 to have:
//   Content-Type:        video/mp4
//   Content-Disposition: inline
//
// HOW TO RUN:
//   1. Fill in your R2 credentials below (or it reads from env vars)
//   2. Run: dotnet run --project FixR2Metadata.csproj
//   (or open in Rider/VS and run the console project)
//
// WHY: Old uploads were stored without Content-Disposition: inline,
//      so browsers treat them as downloads instead of streams.

using Amazon.S3;
using Amazon.S3.Model;

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Production R2 credentials — reads from env vars if set, falls back to hardcoded.
// Set env vars to avoid committing secrets: R2_ACCESS_KEY, R2_SECRET_KEY
var accessKey  = Environment.GetEnvironmentVariable("R2_ACCESS_KEY")
                 ?? "YOUR_PRODUCTION_R2_ACCESS_KEY";
var secretKey  = Environment.GetEnvironmentVariable("R2_SECRET_KEY")
                 ?? "YOUR_PRODUCTION_R2_SECRET_KEY";
var serviceUrl = "https://8b3e366535f1bd09a2ea3f2fbea21f06.r2.cloudflarestorage.com";
var bucketName = "gretora-videos";
// ─────────────────────────────────────────────────────────────────────────────

Console.WriteLine("=== Gretora R2 Metadata Fixer ===");
Console.WriteLine($"Bucket : {bucketName}");
Console.WriteLine($"Goal   : Set Content-Type=video/mp4 & Content-Disposition=inline on all objects");
Console.WriteLine();

var client = new AmazonS3Client(accessKey, secretKey, new AmazonS3Config
{
    ServiceURL    = serviceUrl,
    ForcePathStyle = true
});

// List all objects in the bucket (handles pagination automatically)
var allKeys = new List<string>();
string? continuationToken = null;

do
{
    var listRequest = new ListObjectsV2Request
    {
        BucketName        = bucketName,
        ContinuationToken = continuationToken
    };

    var listResponse = await client.ListObjectsV2Async(listRequest);

    foreach (var obj in listResponse.S3Objects)
    {
        allKeys.Add(obj.Key);
    }

    continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : null;

} while (continuationToken != null);

Console.WriteLine($"Found {allKeys.Count} object(s) in bucket.");
Console.WriteLine();

// Only process .mp4 files (skip any non-video objects)
var videoKeys = allKeys.Where(k => k.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase)).ToList();
Console.WriteLine($"Targeting {videoKeys.Count} .mp4 file(s).");
Console.WriteLine();

int success = 0, failed = 0;

foreach (var key in videoKeys)
{
    try
    {
        Console.Write($"  Fixing: {key} ... ");

        // In S3/R2, to update metadata you must copy the object to itself
        // with MetadataDirective = REPLACE and the new metadata values.
        var copyRequest = new CopyObjectRequest
        {
            SourceBucket      = bucketName,
            SourceKey         = key,
            DestinationBucket = bucketName,
            DestinationKey    = key,
            ContentType       = "video/mp4",
            MetadataDirective = S3MetadataDirective.REPLACE
        };

        // Set Content-Disposition: inline
        copyRequest.Headers.ContentDisposition = "inline";

        await client.CopyObjectAsync(copyRequest);

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("OK");
        Console.ResetColor();
        success++;
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"FAILED — {ex.Message}");
        Console.ResetColor();
        failed++;
    }
}

Console.WriteLine();
Console.WriteLine("=== Done ===");
Console.ForegroundColor = success > 0 ? ConsoleColor.Green : ConsoleColor.Gray;
Console.WriteLine($"  Success : {success}");
Console.ResetColor();
if (failed > 0)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"  Failed  : {failed}");
    Console.ResetColor();
}
