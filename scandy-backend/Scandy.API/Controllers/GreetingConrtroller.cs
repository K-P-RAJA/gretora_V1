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

        // =========================================
        // CREATE GREETING
        // =========================================

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateGreetingRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _greetingService.CreateGreeting(
                Guid.Parse(userId),
                request
            );

            return Ok(result);
        }

        // =========================================
        // GET USER GREETINGS
        // =========================================

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetMyGreetings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _greetingService.GetMyGreetings(
                Guid.Parse(userId)
            );

            return Ok(result);
        }

        // =========================================
        // PUBLIC GREETING VIEW
        // =========================================

        [HttpGet("/g/{id}")]
        public async Task<IActionResult> GetGreeting(Guid id)
        {
            var result = await _greetingService.GetGreeting(id);

            if (result == null)
                return NotFound("Greeting not found");

            return Ok(result);
        }

        // =========================================
        // DELETE GREETING
        // =========================================

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGreeting(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var deleted = await _greetingService.DeleteGreeting(
                id,
                Guid.Parse(userId)
            );

            if (!deleted)
                return NotFound("Greeting not found");

            return Ok(new
            {
                statusCode = 1,
                statusMessage = "Greeting deleted successfully"
            });
        }
    }
}