using Dapper;
using Scandy.API.Models;
using Scandy.API.Request;
using Scandy.API.Response;
using Scandy.API.Response.UserResponse;
using Supabase.Gotrue;

namespace Scandy.API.Services
{
    public class LoginService
    {
        private readonly DatabaseService _db;

        public LoginService(DatabaseService db)
        {
            _db = db;
        }

        public async Task<CommonStatusResponse> CreateProfile(CreateProfileModel request)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new CommonStatusResponse();

            try
            {
                var sqlquery = @"
            INSERT INTO profiles (id, name, email)
            VALUES (@Id, @Name, @Email)
            ON CONFLICT (id) DO NOTHING;
        ";

                await dbConnection.ExecuteAsync(sqlquery, request);

                response.StatusCode = 1;
                response.StatusMessage = "Success";
            }
            catch (Exception ex)
            {
                response.StatusCode = 2;
                response.StatusMessage = ex.Message;
            }

            return response;
        }

        public async Task<GetUserProfileResponse> GetProfile(Guid userId)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new GetUserProfileResponse();

            try
            {
                var query = @"SELECT id AS Id,name AS Name,email AS Email FROM profiles WHERE id = @Id";

                var data = await dbConnection.QueryFirstOrDefaultAsync<UserModel>(
                    query,
                    new { Id = userId }
                );

                if (data == null)
                {
                    response.StatusCode = 2;
                    response.StatusMessage = "Profile not found";
                    response.Data = null;
                }
                else
                {
                    response.StatusCode = 1;
                    response.StatusMessage = "Success";
                    response.Data = data;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                response.StatusCode = 3;
                response.StatusMessage = ex.Message;
                response.Data = null;
            }

            return response;
        }


        public async Task<CommonStatusResponse> UpdateProfile(Guid userId, string name)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new CommonStatusResponse();

            try
            {
                var query = @"UPDATE profiles SET name = @Name WHERE id = @Id";

                var rowsAffected = await dbConnection.ExecuteAsync(
                    query,
                    new { Id = userId, Name = name }
                );

                if (rowsAffected == 0)
                {
                    response.StatusCode = 2;
                    response.StatusMessage = "Profile not found";
                }
                else
                {
                    response.StatusCode = 1;
                    response.StatusMessage = "Profile updated successfully";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 3;
                response.StatusMessage = ex.Message;
            }

            return response;
        }



    }
}
