using System.Text.Json.Serialization;

namespace Gretora.API.Request
{
    public class UpdateGreetingRequest
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public Guid? VideoId { get; set; }

        private string _recipientName = string.Empty;

        [JsonPropertyName("recipientName")]
        public string RecipientName
        {
            get => _recipientName;
            set => _recipientName = value ?? string.Empty;
        }

        [JsonPropertyName("receiptantName")]
        public string ReceiptantName
        {
            get => _recipientName;
            set => _recipientName = value ?? string.Empty;
        }

        private string _occasion = string.Empty;

        [JsonPropertyName("occasion")]
        public string Occasion
        {
            get => _occasion;
            set => _occasion = value ?? string.Empty;
        }

        [JsonPropertyName("occassion")]
        public string Occassion
        {
            get => _occasion;
            set => _occasion = value ?? string.Empty;
        }
    }
}
