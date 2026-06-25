using Gretora.API.Models;

namespace Gretora.API.Response.UserResponse
{
    public class GetUserProfileResponse : CommonStatusResponse
    {
        public UserModel Data { get; set; }
    }
}

