namespace Scandy.API.Request
{
    public class CreateGreetingRequest
    {
        public Guid VideoId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
    }
}
