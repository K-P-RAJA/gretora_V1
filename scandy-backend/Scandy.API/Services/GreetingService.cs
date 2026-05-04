using Dapper;
using Scandy.API.Request;
using Scandy.API.Response.GreetingResponse;

namespace Scandy.API.Services
{
    public class GreetingService
    {
        private readonly DatabaseService _db;
        private readonly IConfiguration _config;

        public GreetingService(DatabaseService db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<CreateGreetingResponse> CreateGreeting(Guid userId, CreateGreetingRequest request)
        {
            var response = new CreateGreetingResponse();

            using var dbConnection = _db.CreateConnection();

            try
            {
                var greetingId = Guid.NewGuid();

                var sql = @"
                    INSERT INTO greetings (id, user_id, video_id, title, message)
                    VALUES (@Id, @UserId, @VideoId, @Title, @Message);
                ";

                await dbConnection.ExecuteAsync(sql, new
                {
                    Id = greetingId,
                    UserId = userId,
                    VideoId = request.VideoId,
                    Title = request.Title,
                    Message = request.Message
                });

                var baseUrl = _config["App:BaseUrl"];
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
    }
}