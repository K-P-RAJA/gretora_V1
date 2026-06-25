namespace Gretora.API.Request
{
    public class UpdateGreetingRequest
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public string ReceiptantName { get; set; }
        public string Occassion { get; set; }
        public Guid? VideoId { get; set; }
    }
}

