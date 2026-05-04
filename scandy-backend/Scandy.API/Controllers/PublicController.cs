using Dapper;
using Microsoft.AspNetCore.Mvc;
using Scandy.API.Services;

namespace Scandy.API.Controllers
{
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly DatabaseService _db;
        private readonly R2Service _r2Service;

        public PublicController(DatabaseService db, R2Service r2Service)
        {
            _db = db;
            _r2Service = r2Service;
        }

        [HttpGet("g/{id}")]
        public async Task<IActionResult> GetGreeting(Guid id)
        {
            using var dbConnection = _db.CreateConnection();

            var query = @"
                SELECT v.file_path, g.title, g.message
                FROM greetings g
                JOIN videos v ON g.video_id = v.id
                WHERE g.id = @Id;
            ";

            var data = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                query,
                new { Id = id }
            );

            if (data == null)
                return NotFound("Greeting not found");

            // 🔥 Generate signed URL every time
            var videoUrl = _r2Service.GetSignedUrl((string)data.file_path);

            return Ok(new
            {
                title = data.title,
                message = data.message,
                videoUrl = videoUrl
            });
        }
    }
}