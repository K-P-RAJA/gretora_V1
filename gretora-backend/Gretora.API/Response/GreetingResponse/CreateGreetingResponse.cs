namespace Gretora.API.Response.GreetingResponse
{
    public class CreateGreetingResponse : CommonStatusResponse
    {
        public Guid GreetingId { get; set; }
        public string QrUrl { get; set; }
    }
}

