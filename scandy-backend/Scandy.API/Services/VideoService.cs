using Dapper;
using Scandy.API.Models;
using Scandy.API.Response;
using Scandy.API.Response.VideoResponse;

namespace Scandy.API.Services
{
    public class VideoService
    {
        private readonly DatabaseService _db;
        private readonly R2Service _r2Service;

        public VideoService(DatabaseService db, R2Service r2Service)
        {
            _db = db;
            _r2Service = r2Service;
        }

        public async Task<UploadVideoResponse> UploadVideo(Guid userId, IFormFile file)
        {
            var response = new UploadVideoResponse();

            using var dbConnection = _db.CreateConnection();

            try
            {
                var videoId = Guid.NewGuid();

                // ✅ 1. Upload to R2
                var filePath = await _r2Service.UploadAsync(file, userId.ToString());

                // ✅ 2. Save in DB
                var sql = @"
                    INSERT INTO videos (id, user_id, title, file_path, created_at)
                    VALUES (@Id, @UserId, @Title, @FilePath, NOW());
                ";

                var video = new
                {
                    Id = videoId,
                    UserId = userId,
                    Title = file.FileName,
                    FilePath = filePath
                };

                await dbConnection.ExecuteAsync(sql, video);

                response.StatusCode = 1;
                response.StatusMessage = "Video uploaded successfully";
                response.VideoId = videoId;
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