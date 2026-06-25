using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gretora.API.Services;

namespace Gretora.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class LogsController : ControllerBase
    {
        private readonly LogService _logService;

        public LogsController(LogService logService)
        {
            _logService = logService;
        }

        // Public endpoint to receive frontend client errors
        [HttpPost("logs/client")]
        public async Task<IActionResult> LogClientError([FromBody] ClientLogRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Message))
            {
                return BadRequest("Invalid client log request.");
            }

            string details = $"URL: {request.Url}\nUserAgent: {request.UserAgent}\nStackTrace: {request.StackTrace}";
            await _logService.LogAsync(request.Level ?? "ERROR", "Frontend", request.Message, details);
            return Ok();
        }
    }

    public class ClientLogRequest
    {
        public string? Level { get; set; }
        public string Message { get; set; } = null!;
        public string? StackTrace { get; set; }
        public string? Url { get; set; }
        public string? UserAgent { get; set; }
    }
}
