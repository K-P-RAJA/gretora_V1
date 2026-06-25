using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gretora.API.Request;
using Gretora.API.Services;
using System.Security.Claims;

namespace Gretora.API.Controllers
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

        [HttpGet("/api/g/{id}")]
        public async Task<IActionResult> GetGreeting(Guid id)
        {
            // Extract country code from Cloudflare header or custom headers
            string? countryCode = HttpContext.Request.Headers["CF-IPCountry"].ToString();
            if (string.IsNullOrEmpty(countryCode))
            {
                countryCode = HttpContext.Request.Headers["X-Country-Code"].ToString();
            }

            // Failsafe/Local Dev Demo: if empty or XX, pick a random country from a curated list
            if (string.IsNullOrEmpty(countryCode) || countryCode == "XX")
            {
                var countries = new[] { "US", "IN", "GB", "CA", "DE", "FR", "AU", "JP" };
                var random = new Random();
                countryCode = countries[random.Next(countries.Length)];
            }

            var result = await _greetingService.GetGreeting(id, countryCode);

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

        // =========================================
        // UPDATE GREETING
        // =========================================

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGreeting(Guid id, [FromBody] UpdateGreetingRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var updated = await _greetingService.UpdateGreeting(
                id,
                Guid.Parse(userId),
                request
            );

            if (!updated)
                return NotFound("Greeting not found or unauthorized");

            return Ok(new
            {
                statusCode = 1,
                statusMessage = "Greeting updated successfully"
            });
        }

        // =========================================
        // REPORT GREETING
        // =========================================

        [HttpPost("{id}/report")]
        public async Task<IActionResult> ReportGreeting(Guid id, [FromBody] ReportGreetingRequest request)
        {
            var result = await _greetingService.ReportGreeting(
                id,
                request.Reason,
                request.Details
            );

            if (!result)
                return StatusCode(500, new { statusMessage = "Failed to submit report" });

            return Ok(new
            {
                statusCode = 1,
                statusMessage = "Report submitted successfully. Our team will review it."
            });
        }
    }
}
