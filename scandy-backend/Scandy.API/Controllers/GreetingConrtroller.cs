using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scandy.API.Request;
using Scandy.API.Services;
using System.Security.Claims;

namespace Scandy.API.Controllers
{
    [ApiController]
    [Route("api/greetings")]
    public class GreetingController : ControllerBase
    {
        private readonly GreetingService _greetingService;

        public GreetingController(GreetingService greetingService)
        {
            _greetingService = greetingService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGreetingRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _greetingService.CreateGreeting(Guid.Parse(userId), request);

            return Ok(result);
        }
    }
}