namespace Scandy.API.Request
{
    public class ReportGreetingRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
