using Microsoft.AspNetCore.Mvc;
using Scandy.API.Services;
using Supabase.Gotrue;
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

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _videoService.UploadVideo(Guid.Parse(userId), file);

        return Ok(result);
    }
}