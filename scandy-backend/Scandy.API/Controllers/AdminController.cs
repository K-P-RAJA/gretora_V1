using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scandy.API.Services;
using System.Security.Claims;

namespace Scandy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        // =========================================
        // HELPER: ADMIN CHECK
        // =========================================
        private async Task<bool> CheckIfAdmin()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return false;

            if (!Guid.TryParse(userIdStr, out var userId))
                return false;

            return await _adminService.IsAdmin(userId);
        }

        // =========================================
        // ENDPOINT: CHECK ADMIN STATUS
        // =========================================
        [Authorize]
        [HttpGet("check")]
        public async Task<IActionResult> CheckAdmin()
        {
            var isAdmin = await CheckIfAdmin();
            return Ok(new { IsAdmin = isAdmin });
        }

        // =========================================
        // ENDPOINT: DASHBOARD STATS
        // =========================================
        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var stats = await _adminService.GetDashboardStats();
            return Ok(stats);
        }

        // =========================================
        // ENDPOINT: GET ALL REPORTS
        // =========================================
        [Authorize]
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports([FromQuery] string? status)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var reports = await _adminService.GetAllReports(status);
            return Ok(reports);
        }

        // =========================================
        // ENDPOINT: UPDATE REPORT STATUS
        // =========================================
        public class UpdateReportRequest
        {
            public string Status { get; set; } = string.Empty;
        }

        [Authorize]
        [HttpPut("reports/{id}")]
        public async Task<IActionResult> UpdateReport(Guid id, [FromBody] UpdateReportRequest request)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            if (string.IsNullOrEmpty(request.Status))
                return BadRequest("Status is required");

            var success = await _adminService.UpdateReportStatus(id, request.Status);
            if (!success)
                return NotFound("Report not found");

            return Ok(new { StatusCode = 1, StatusMessage = "Report updated successfully" });
        }

        // =========================================
        // ENDPOINT: GET ALL USERS
        // =========================================
        [Authorize]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var users = await _adminService.GetAllUsers(search);
            return Ok(users);
        }

        // =========================================
        // ENDPOINT: BAN/UNBAN USER
        // =========================================
        public class UpdateUserBanRequest
        {
            public bool IsBanned { get; set; }
        }

        [Authorize]
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> UpdateUserBan(Guid id, [FromBody] UpdateUserBanRequest request)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var success = await _adminService.UpdateUserBanStatus(id, request.IsBanned);
            if (!success)
                return NotFound("User profile not found");

            return Ok(new { StatusCode = 1, StatusMessage = request.IsBanned ? "User banned successfully" : "User unbanned successfully" });
        }

        // =========================================
        // ENDPOINT: GET ALL GREETINGS
        // =========================================
        [Authorize]
        [HttpGet("greetings")]
        public async Task<IActionResult> GetGreetings([FromQuery] string? search)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var greetings = await _adminService.GetAllGreetings(search);
            return Ok(greetings);
        }

        // =========================================
        // ENDPOINT: FORCE-DELETE GREETING
        // =========================================
        [Authorize]
        [HttpDelete("greetings/{id}")]
        public async Task<IActionResult> DeleteGreeting(Guid id)
        {
            if (!await CheckIfAdmin())
                return Forbid();

            var success = await _adminService.DeleteGreetingAdmin(id);
            if (!success)
                return NotFound("Greeting not found");

            return Ok(new { StatusCode = 1, StatusMessage = "Greeting and associated media removed successfully" });
        }
    }
}
