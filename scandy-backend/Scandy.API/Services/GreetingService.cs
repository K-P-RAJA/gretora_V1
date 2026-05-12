using Dapper;
using Scandy.API.Request;
using Scandy.API.Response.GreetingResponse;

namespace Scandy.API.Services
{
    public class GreetingService
    {
        private readonly DatabaseService _db;
        private readonly IConfiguration _config;
        private readonly R2Service _r2Service;

        public GreetingService(
            DatabaseService db,
            IConfiguration config,
            R2Service r2Service)
        {
            _db = db;
            _config = config;
            _r2Service = r2Service;
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

                response.StatusCode = 1;
                response.StatusMessage = "Greeting created successfully";
                response.GreetingId = greetingId;
                response.QrUrl = qrUrl;
            }
            catch (Exception ex)
            {
                response.StatusCode = 2;
                response.StatusMessage = ex.Message;
            }

            return response;
        }

        // =========================================
        // GET SINGLE GREETING
        // =========================================

        public async Task<object?> GetGreeting(Guid id)
        {
            using var dbConnection = _db.CreateConnection();

            var query = @"
                SELECT
                    v.file_path,
                    g.title,
                    g.message
                FROM greetings g
                JOIN videos v
                    ON g.video_id = v.id
                WHERE g.id = @Id;
            ";

            var data = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                query,
                new { Id = id }
            );

            if (data == null)
                return null;

            return new
            {
                title = data.title,
                message = data.message,
                videoUrl = _r2Service.GetSignedUrl(
                    (string)data.file_path
                )
            };
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
                    v.file_path
                FROM greetings g
                JOIN videos v
                    ON g.video_id = v.id
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
                )
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
    }
}