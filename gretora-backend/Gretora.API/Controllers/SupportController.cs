using Dapper;
using Microsoft.AspNetCore.Mvc;
using Gretora.API.Services;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Gretora.API.Controllers
{
    [ApiController]
    [Route("api/support")]
    public class SupportController : ControllerBase
    {
        private readonly DatabaseService _db;
        private readonly LogService _logService;

        public SupportController(DatabaseService db, LogService logService)
        {
            _db = db;
            _logService = logService;
        }

        public class SubmitTicketRequest
        {
            [Required]
            public string Name { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            public string? Subject { get; set; }

            [Required]
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitTicket([FromBody] SubmitTicketRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var connection = _db.CreateConnection();
            var sql = @"
                INSERT INTO public.support_tickets (name, email, subject, message, status, created_at)
                VALUES (@Name, @Email, @Subject, @Message, 'Pending', NOW())
                RETURNING id;
            ";

            try
            {
                var ticketId = await connection.ExecuteScalarAsync<Guid>(sql, new
                {
                    Name = request.Name,
                    Email = request.Email,
                    Subject = request.Subject,
                    Message = request.Message
                });

                return Ok(new
                {
                    StatusCode = 1,
                    StatusMessage = "Your support request has been submitted successfully.",
                    TicketId = ticketId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Support Error] Failed to submit ticket: {ex.Message}");
                
                // Write to Admin Log system so we can view it in the dashboard
                try 
                {
                    await _logService.LogAsync(
                        "ERROR", 
                        "Backend", 
                        $"Failed to submit support ticket from email: {request.Email}", 
                        ex.ToString()
                    );
                }
                catch {}

                return StatusCode(500, "An error occurred while saving your support request. Please try again later.");
            }
        }
    }
}

