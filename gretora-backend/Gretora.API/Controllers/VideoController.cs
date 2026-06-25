using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gretora.API.Request;
using Gretora.API.Services;
using System.Security.Claims;

[ApiController]
[Route("api/videos")]
public class VideoController : ControllerBase
{
    private readonly VideoService _videoService;

    public VideoController(VideoService videoService)
    {
        _videoService = videoService;
    }

    [Authorize]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] UploadVideoRequest request
    )
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new
            {
                StatusCode = 2,
                StatusMessage = "Invalid token"
            });
        }

        if (request.File == null)
        {
            return BadRequest(new
            {
                StatusCode = 3,
                StatusMessage = "No file uploaded"
            });
        }

        var result = await _videoService.UploadVideo(
            Guid.Parse(userId),
            request.File
        );

        return Ok(result);
    }
}
