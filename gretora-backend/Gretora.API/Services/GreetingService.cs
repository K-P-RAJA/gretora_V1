using Dapper;
using Gretora.API.Request;
using Gretora.API.Response.GreetingResponse;

namespace Gretora.API.Services
{
    public class GreetingService
    {
        private readonly DatabaseService _db;
        private readonly IConfiguration _config;
        private readonly R2Service _r2Service;
        private readonly LogService _logService;

        public GreetingService(
            DatabaseService db,
            IConfiguration config,
            R2Service r2Service,
            LogService logService)
        {
            _db = db;
            _config = config;
            _r2Service = r2Service;
            _logService = logService;
        }

        // =========================================
        // CREATE GREETING
        // =========================================

        public async Task<CreateGreetingResponse> CreateGreeting(
            Guid userId,
            CreateGreetingRequest request)
        {
            var response = new CreateGreetingResponse();

            using var dbConnection = _db.CreateConnection();

            try
            {
                var greetingId = Guid.NewGuid();

                var sql = @"
                    INSERT INTO greetings
                    (
                        id,
                        user_id,
                        video_id,
                        title,
                        message,
                        occassion,
                        receiptant_name
                    )
                    VALUES
                    (
                        @Id,
                        @UserId,
                        @VideoId,
                        @Title,
                        @Message,
                        @Occassion,
                        @ReceiptantName
                    );
                ";

                await dbConnection.ExecuteAsync(sql, new
                {
                    Id = greetingId,
                    UserId = userId,
                    VideoId = request.VideoId,
                    Title = request.Title,
                    Message = request.Message,
                    Occassion = request.Occassion,
                    ReceiptantName = request.ReceiptantName,
                });

                var baseUrl = _config["App:FrontendUrl"];
                var qrUrl = $"{baseUrl}/g/{greetingId}";

                // --- Register QR Code Record ---
                try
                {
                    var qrId = Guid.NewGuid();
                    await dbConnection.ExecuteAsync(@"
                        INSERT INTO qr_codes (id, video_id, watch_url, scan_count)
                        VALUES (@QrId, @VideoId, @WatchUrl, 0);
                    ", new
                    {
                        QrId = qrId,
                        VideoId = request.VideoId,
                        WatchUrl = qrUrl
                    });
                }
                catch (Exception qrEx)
                {
                    Console.WriteLine($"[Telemetry Warning] Failed to insert QR code record: {qrEx.Message}");
                }
                // -------------------------------

                response.StatusCode = 1;
                response.StatusMessage = "Greeting created successfully";
                response.GreetingId = greetingId;
                response.QrUrl = qrUrl;
            }
            catch (Exception ex)
            {
                response.StatusCode = 2;
                response.StatusMessage = ex.Message;
                
                try
                {
                    await _logService.LogAsync(
                        "ERROR",
                        "GreetingService",
                        $"Failed to create greeting for user {userId}: {ex.Message}",
                        ex.ToString()
                    );
                }
                catch {}
            }

            return response;
        }

        // =========================================
        // GET SINGLE GREETING
        // =========================================

        public async Task<object?> GetGreeting(Guid id, string? countryCode = null)
        {
            using var dbConnection = _db.CreateConnection();

            var query = @"
                SELECT 
                    v.file_path as file_path, 
                    g.title as title, 
                    g.message as message,
                    g.video_id as video_id
                FROM greetings g
                JOIN videos v ON g.video_id = v.id
                WHERE g.id = @Id;
            ";

            try 
            {
                var data = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                    query,
                    new { Id = id }
                );

                if (data == null) return null;

                // Ensure we handle potential mapping issues by converting to a dictionary if needed, 
                // or just access by property name as returned by Npgsql (usually lowercase)
                var title = data.title?.ToString();
                var message = data.message?.ToString();
                var filePath = data.file_path?.ToString();
                var videoIdStr = data.video_id?.ToString();

                if (string.IsNullOrEmpty(filePath)) return null;

                // --- QR Scan Tracking & Analytics Log ---
                try
                {
                    var greetingIdString = id.ToString();
                    
                    // 1. Try to find the qr_codes record where watch_url contains the greeting id
                    var qrId = await dbConnection.QueryFirstOrDefaultAsync<Guid?>(
                        "SELECT id FROM qr_codes WHERE watch_url LIKE '%' || @GreetingIdString || '%' LIMIT 1",
                        new { GreetingIdString = greetingIdString }
                    );

                    if (!qrId.HasValue)
                    {
                        // Auto-create/Self-heal QR code record if it does not exist
                        var baseUrl = _config["App:FrontendUrl"];
                        var qrUrl = $"{baseUrl}/g/{id}";
                        var newQrId = Guid.NewGuid();
                        Guid? parsedVideoId = null;
                        if (videoIdStr != null)
                        {
                            if (Guid.TryParse(videoIdStr.ToString(), out Guid parsedId))
                            {
                                parsedVideoId = parsedId;
                            }
                        }

                        await dbConnection.ExecuteAsync(@"
                            INSERT INTO qr_codes (id, video_id, watch_url, scan_count)
                            VALUES (@QrId, @VideoId, @WatchUrl, 1);
                        ", new { QrId = newQrId, VideoId = parsedVideoId, WatchUrl = qrUrl });
                        
                        qrId = newQrId;

                        // Insert into scan_logs for geographical telemetry
                        await dbConnection.ExecuteAsync(@"
                            INSERT INTO scan_logs (id, qr_id, scanned_at, country_code)
                            VALUES (gen_random_uuid(), @QrId, NOW(), @CountryCode);
                        ", new { QrId = qrId.Value, CountryCode = countryCode ?? "US" });
                    }
                    else
                    {
                        // Concurrency/Duplicate check: Ignore scans within 5 seconds for the same QR code
                        // This prevents React 18 Strict Mode double-render or double-page mounts from skewing counts
                        var recentScanExists = await dbConnection.ExecuteScalarAsync<bool>(@"
                            SELECT EXISTS (
                                SELECT 1 FROM scan_logs 
                                WHERE qr_id = @QrId 
                                AND scanned_at >= NOW() - INTERVAL '5 seconds'
                            );
                        ", new { QrId = qrId.Value });

                        if (!recentScanExists)
                        {
                            // Increment scan count
                            await dbConnection.ExecuteAsync(@"
                                UPDATE qr_codes 
                                SET scan_count = COALESCE(scan_count, 0) + 1 
                                WHERE id = @QrId;
                            ", new { QrId = qrId.Value });

                            // Insert into scan_logs for geographical telemetry
                            await dbConnection.ExecuteAsync(@"
                                INSERT INTO scan_logs (id, qr_id, scanned_at, country_code)
                                VALUES (gen_random_uuid(), @QrId, NOW(), @CountryCode);
                            ", new { QrId = qrId.Value, CountryCode = countryCode ?? "US" });
                        }
                    }
                }
                catch (Exception qrEx)
                {
                    // Fail silently so telemetry issues never break core greeting view
                    Console.WriteLine($"[Telemetry Warning] Failed to log scan telemetry: {qrEx.Message}");
                }
                // ----------------------------------------

                return new
                {
                    title = title,
                    message = message,
                    videoUrl = _r2Service.GetSignedUrl(filePath)
                };
            }
            catch (Exception ex)
            {
                // Log the precise error (simplified here for brevity)
                Console.WriteLine($"[ERROR] GetGreeting failed for {id}: {ex.Message}");
                throw; // Rethrow to let the controller handle it as 500
            }
        }

        // =========================================
        // GET ALL USER GREETINGS
        // =========================================

        public async Task<IEnumerable<object>> GetMyGreetings(Guid userId)
        {
            using var dbConnection = _db.CreateConnection();

            var query = @"
                SELECT
                    g.id,
                    g.title,
                    g.message,
                    g.created_at,
                    g.receiptant_name,
                    g.occassion,
                    v.file_path,
                    COALESCE(qc.scan_count, 0) AS scan_count,
                    COALESCE((SELECT status FROM reports WHERE greeting_id = g.id ORDER BY reported_at DESC LIMIT 1), 'Active') AS moderation_status
                FROM greetings g
                JOIN videos v ON g.video_id = v.id
                LEFT JOIN qr_codes qc ON g.video_id = qc.video_id
                WHERE g.user_id = @UserId
                ORDER BY g.created_at DESC;
            ";

            var greetings = await dbConnection.QueryAsync<dynamic>(
                query,
                new
                {
                    UserId = userId
                }
            );

            var baseUrl = _config["App:FrontendUrl"];

            return greetings.Select(g => new
            {
                id = g.id,
                title = g.title,
                message = g.message,
                createdAt = g.created_at,
                receiptantName = g.receiptant_name,
                occassion = g.occassion,

                qrUrl = $"{baseUrl}/g/{g.id}",

                videoUrl = _r2Service.GetSignedUrl(
                    (string)g.file_path
                ),

                scanCount = g.scan_count,
                status = g.moderation_status
            });
        }

        // =========================================
        // DELETE GREETING
        // =========================================

        public async Task<bool> DeleteGreeting(Guid greetingId,Guid userId)
        {
            using var dbConnection = _db.CreateConnection();

            // Get video info first
            var greeting = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                @"
        SELECT g.video_id, v.file_path
        FROM greetings g
        JOIN videos v
            ON g.video_id = v.id
        WHERE g.id = @GreetingId
        AND g.user_id = @UserId;
        ",
                new
                {
                    GreetingId = greetingId,
                    UserId = userId
                }
            );

            if (greeting == null)
                return false;

            // Delete greeting
            await dbConnection.ExecuteAsync(
                @"
        DELETE FROM greetings
        WHERE id = @GreetingId;
        ",
                new
                {
                    GreetingId = greetingId
                }
            );

            // --- Clean Up associated QR Code record & scan logs ---
            try
            {
                var greetingIdString = greetingId.ToString();
                // Manually delete logs first to be completely foreign key compliant, regardless of cascade config
                await dbConnection.ExecuteAsync(@"
                    DELETE FROM scan_logs 
                    WHERE qr_id IN (SELECT id FROM qr_codes WHERE watch_url LIKE '%' || @GreetingIdString || '%');
                    
                    DELETE FROM qr_codes 
                    WHERE watch_url LIKE '%' || @GreetingIdString || '%';
                ", new { GreetingIdString = greetingIdString });
            }
            catch (Exception qrEx)
            {
                Console.WriteLine($"[QR Delete Warning] Failed to delete QR record: {qrEx.Message}");
            }
            // ------------------------------------------

            // Check if video still used
            var usageCount = await dbConnection.ExecuteScalarAsync<int>(
                @"
        SELECT COUNT(*)
        FROM greetings
        WHERE video_id = @VideoId;
        ",
                new
                {
                    VideoId = greeting.video_id
                }
            );

            // Delete video if unused
            if (usageCount == 0)
            {
                // Delete DB video row
                await dbConnection.ExecuteAsync(
                    @"
            DELETE FROM videos
            WHERE id = @VideoId;
            ",
                    new
                    {
                        VideoId = greeting.video_id
                    }
                );

                // Delete actual file from R2
                await _r2Service.DeleteFile(
                    (string)greeting.file_path
                );
            }

            return true;
        }

        // =========================================
        // UPDATE GREETING
        // =========================================

        public async Task<bool> UpdateGreeting(Guid greetingId, Guid userId, UpdateGreetingRequest request)
        {
            using var dbConnection = _db.CreateConnection();

            // Fetch the existing greeting to check ownership and get the old video_id
            var existingGreeting = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                @"
                SELECT video_id
                FROM greetings
                WHERE id = @GreetingId AND user_id = @UserId;
                ",
                new { GreetingId = greetingId, UserId = userId }
            );

            if (existingGreeting == null)
            {
                // Greeting not found or user doesn't own it
                return false;
            }

            var oldVideoId = (Guid)existingGreeting.video_id;

            // Update the greeting fields
            var updateQuery = @"
                UPDATE greetings
                SET 
                    title = @Title,
                    message = @Message,
                    receiptant_name = @ReceiptantName,
                    occassion = @Occassion
                    " + (request.VideoId.HasValue ? ", video_id = @NewVideoId " : " ") + @"
                WHERE id = @GreetingId AND user_id = @UserId;
            ";

            await dbConnection.ExecuteAsync(updateQuery, new
            {
                Title = request.Title,
                Message = request.Message,
                ReceiptantName = request.ReceiptantName,
                Occassion = request.Occassion,
                NewVideoId = request.VideoId,
                GreetingId = greetingId,
                UserId = userId
            });

            // If video was replaced, clean up the old video
            if (request.VideoId.HasValue && request.VideoId.Value != oldVideoId)
            {
                // Check if old video is still used by any other greeting
                var usageCount = await dbConnection.ExecuteScalarAsync<int>(
                    @"
                    SELECT COUNT(*)
                    FROM greetings
                    WHERE video_id = @OldVideoId;
                    ",
                    new { OldVideoId = oldVideoId }
                );

                if (usageCount == 0)
                {
                    // Fetch the file path to delete from R2
                    var filePath = await dbConnection.ExecuteScalarAsync<string>(
                        @"
                        SELECT file_path
                        FROM videos
                        WHERE id = @OldVideoId;
                        ",
                        new { OldVideoId = oldVideoId }
                    );

                    // Delete DB row
                    await dbConnection.ExecuteAsync(
                        @"
                        DELETE FROM videos
                        WHERE id = @OldVideoId;
                        ",
                        new { OldVideoId = oldVideoId }
                    );

                    // Delete from R2
                    if (!string.IsNullOrEmpty(filePath))
                    {
                        await _r2Service.DeleteFile(filePath);
                    }
                }
            }

            return true;
        }

        // =========================================
        // REPORT GREETING
        // =========================================

        public async Task<bool> ReportGreeting(Guid greetingId, string reason, string? details)
        {
            using var dbConnection = _db.CreateConnection();

            try
            {
                var sql = @"
                    INSERT INTO reports (id, greeting_id, reason, details)
                    VALUES (@Id, @GreetingId, @Reason, @Details);
                ";

                await dbConnection.ExecuteAsync(sql, new
                {
                    Id = Guid.NewGuid(),
                    GreetingId = greetingId,
                    Reason = reason,
                    Details = details
                });

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] ReportGreeting failed: {ex.Message}");
                try { await _logService.LogAsync("ERROR", "GreetingService", $"ReportGreeting failed for greeting {greetingId}: {ex.Message}", ex.ToString()); } catch {}
                return false;
            }
        }
    }
}
