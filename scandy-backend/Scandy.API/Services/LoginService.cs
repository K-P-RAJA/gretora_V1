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

        public async Task<GetProfileDashboardResponse> GetProfileDashboard(Guid userId)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new GetProfileDashboardResponse();

            try
            {
                // PROFILE
                var profileQuery = @"
            SELECT
                name,
                email,
                created_at
            FROM profiles
            WHERE id = @Id
        ";

                var profile = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                    profileQuery,
                    new { Id = userId }
                );

                if (profile == null)
                {
                    response.StatusCode = 2;
                    response.StatusMessage = "Profile not found";

                    return response;
                }

                // GREETINGS COUNT
                var greetingsCount = await dbConnection.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(*) FROM greetings WHERE user_id = @Id",
                    new { Id = userId }
                );

                // VIDEOS COUNT
                var videosCount = await dbConnection.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(*) FROM videos WHERE user_id = @Id",
                    new { Id = userId }
                );

                // RECENT GREETINGS
                var recentGreetings = await dbConnection.QueryAsync<RecentGreetingModel>(
                    @"
                SELECT
                    title,
                    occassion,
                    created_at AS CreatedAt
                FROM greetings
                WHERE user_id = @Id
                ORDER BY created_at DESC
                LIMIT 3
            ",
                    new { Id = userId }
                );

                response.StatusCode = 1;
                response.StatusMessage = "Success";

                response.Name = profile.name;
                response.Email = profile.email;
                response.CreatedAt = profile.created_at;

                response.GreetingsCount = greetingsCount;
                response.VideosCount = videosCount;

                response.RecentGreetings = recentGreetings.ToList();
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
