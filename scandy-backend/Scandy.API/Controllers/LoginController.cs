using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scandy.API.Models;
using Scandy.API.Request;
using Scandy.API.Response;
using Scandy.API.Response.UserResponse;
using Scandy.API.Services;
using System.Security.Claims;

namespace Scandy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly LoginService _loginService;

        public LoginController(LoginService loginService)
        {
            _loginService = loginService;
        }

        [Authorize]
        [HttpPost("CreateProfile")]
        public async Task<IActionResult> CreateProfile([FromBody] CreateProfileRequest request)
        {
            

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            if (userId == null || email == null)
            {
                return Unauthorized(new CommonStatusResponse
                {
                    StatusCode = 2,
                    StatusMessage = "Invalid token"
                });
            }

            var response = await _loginService.CreateProfile(new CreateProfileModel
            {
                Id = Guid.Parse(userId),
                Name = request.Name,
                Email = email
            });

            return Ok(response);
        }

        [Authorize]
        [HttpGet("GetProfile")]
        public async Task<GetUserProfileResponse> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (userId == null)
            {
                return new GetUserProfileResponse
                {
                    StatusCode = 2,
                    StatusMessage = "Invalid token"
                };
            }

            return await _loginService.GetProfile(Guid.Parse(userId), name, email);
        }


        [Authorize]
        [HttpPut("UpdateProfile")]
        public async Task<CommonStatusResponse> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return new CommonStatusResponse
                {
                    StatusCode = 2,
                    StatusMessage = "Invalid token"
                };
            }

            return await _loginService.UpdateProfile(
                Guid.Parse(userId),
                request.Name
            );
        }

        [Authorize]
        [HttpGet("profile/dashboard")]
        public async Task<IActionResult> GetProfileDashboard()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _loginService.GetProfileDashboard(
                Guid.Parse(userId)
            );

            return Ok(result);
        }

        [Authorize]
        [HttpPost("accept-policy")]
        public async Task<IActionResult> AcceptPolicy()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _loginService.AcceptPolicy(Guid.Parse(userId));

            return Ok(result);
        }

        [Authorize]
        [HttpPost("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
                return Unauthorized();

            var result = await _loginService.PermanentlyDeleteAccount(Guid.Parse(userId), email);
            return Ok(result);
        }
    }
}