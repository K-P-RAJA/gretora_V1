using Scandy.API.Models;

namespace Scandy.API.Response.UserResponse
{
    public class GetUserProfileResponse : CommonStatusResponse
    {
        public UserModel Data { get; set; }
    }
}
