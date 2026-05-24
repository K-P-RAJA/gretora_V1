namespace Scandy.API.Models
{
    public class UserModel
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        public string? Email { get; set; }

        public bool HasAcceptedPolicy { get; set; }

        public bool IsAdmin { get; set; }

        public bool IsBanned { get; set; }
    }
}
