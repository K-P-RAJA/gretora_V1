using Dapper;
using Gretora.API.Models;
using Gretora.API.Request;
using Gretora.API.Response;
using Gretora.API.Response.UserResponse;
using Supabase.Gotrue;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;
using System.Collections.Concurrent;

namespace Gretora.API.Services
{
    public class LoginService
    {
        private readonly DatabaseService _db;
        private readonly IConfiguration _config;
        private readonly LogService _logService;
        private static readonly ConcurrentDictionary<Guid, (string Otp, DateTime Expiry)> _otpCache = new();

        public LoginService(DatabaseService db, IConfiguration config, LogService logService)
        {
            _db = db;
            _config = config;
            _logService = logService;
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
                try { await _logService.LogAsync("ERROR", "LoginService", $"Failed to create profile: {ex.Message}", ex.ToString()); } catch {}
            }

            return response;
        }

        public async Task<GetUserProfileResponse> GetProfile(Guid userId, string? name = null, string? email = null)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new GetUserProfileResponse();

            try
            {
                var query = @"SELECT id AS Id, name AS Name, email AS Email, has_accepted_policy AS HasAcceptedPolicy, is_admin AS IsAdmin, is_banned AS IsBanned FROM profiles WHERE id = @Id";

                var data = await dbConnection.QueryFirstOrDefaultAsync<UserModel>(
                    query,
                    new { Id = userId }
                );

                if (data == null && !string.IsNullOrEmpty(email))
                {
                    // Auto-generate profile for first-time OAuth / Google sign ins
                    var displayName = !string.IsNullOrEmpty(name) ? name : email.Split('@')[0];
                    await CreateProfile(new CreateProfileModel
                    {
                        Id = userId,
                        Name = displayName,
                        Email = email
                    });

                    // Re-query new profile
                    data = await dbConnection.QueryFirstOrDefaultAsync<UserModel>(
                        query,
                        new { Id = userId }
                    );
                }

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
                response.StatusCode = 3;
                response.StatusMessage = ex.Message;
                response.Data = null;
                try { await _logService.LogAsync("ERROR", "LoginService", $"Failed to fetch profile for user {userId}: {ex.Message}", ex.ToString()); } catch {}
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
                try { await _logService.LogAsync("ERROR", "LoginService", $"Failed to update profile for user {userId}: {ex.Message}", ex.ToString()); } catch {}
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
                try { await _logService.LogAsync("ERROR", "LoginService", $"Failed to load dashboard statistics for user {userId}: {ex.Message}", ex.ToString()); } catch {}
            }

            return response;
        }

        public async Task<CommonStatusResponse> AcceptPolicy(Guid userId)
        {
            using var dbConnection = _db.CreateConnection();

            var response = new CommonStatusResponse();

            try
            {
                var query = @"UPDATE profiles SET has_accepted_policy = TRUE WHERE id = @Id";

                var rowsAffected = await dbConnection.ExecuteAsync(
                    query,
                    new { Id = userId }
                );

                if (rowsAffected == 0)
                {
                    response.StatusCode = 2;
                    response.StatusMessage = "Profile not found";
                }
                else
                {
                    response.StatusCode = 1;
                    response.StatusMessage = "Policy accepted successfully";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 3;
                response.StatusMessage = ex.Message;
                try { await _logService.LogAsync("ERROR", "LoginService", $"Failed to accept policy for user {userId}: {ex.Message}", ex.ToString()); } catch {}
            }

            return response;
        }

        public async Task<CommonStatusResponse> PermanentlyDeleteAccount(Guid userId, string email)
        {
            var response = new CommonStatusResponse();
            using var dbConnection = _db.CreateConnection();
            dbConnection.Open();
            using var transaction = dbConnection.BeginTransaction();

            try
            {
                // 1. DELETE GREETINGS (Postgres cascade will delete associated reports automatically)
                var deleteGreetingsQuery = "DELETE FROM greetings WHERE user_id = @Id";
                await dbConnection.ExecuteAsync(deleteGreetingsQuery, new { Id = userId }, transaction);

                // 2. DELETE VIDEOS
                var deleteVideosQuery = "DELETE FROM videos WHERE user_id = @Id";
                await dbConnection.ExecuteAsync(deleteVideosQuery, new { Id = userId }, transaction);

                // 3. DELETE SUPPORT TICKETS (Match by their registered profile email)
                var deleteSupportQuery = "DELETE FROM support_tickets WHERE email = @Email";
                await dbConnection.ExecuteAsync(deleteSupportQuery, new { Email = email }, transaction);

                // 4. DELETE PROFILE (DB Data is deleted FIRST!)
                var deleteProfileQuery = "DELETE FROM profiles WHERE id = @Id";
                var rows = await dbConnection.ExecuteAsync(deleteProfileQuery, new { Id = userId }, transaction);

                transaction.Commit();

                if (rows == 0)
                {
                    response.StatusCode = 2;
                    response.StatusMessage = "Account profile not found.";
                    return response;
                }

                // 5. PURGE AUTH USER FROM SUPABASE GOTRUE (Backend Admin API call)
                var serviceRoleKey = _config["Supabase:ServiceRoleKey"];
                var supabaseUrl = _config["Supabase:Url"];

                if (!string.IsNullOrEmpty(serviceRoleKey) && !string.IsNullOrEmpty(supabaseUrl))
                {
                    try
                    {
                        using var client = new HttpClient();
                        client.DefaultRequestHeaders.Add("apikey", serviceRoleKey);
                        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", serviceRoleKey);

                        var requestUrl = $"{supabaseUrl.TrimEnd('/')}/auth/v1/admin/users/{userId}";
                        var httpResponse = await client.DeleteAsync(requestUrl);

                        if (!httpResponse.IsSuccessStatusCode)
                        {
                            var errorContent = await httpResponse.Content.ReadAsStringAsync();
                            Console.WriteLine($"[Supabase Purge Error] Status: {httpResponse.StatusCode}, Detail: {errorContent}");
                            // We don't block the database success if Supabase admin fails on an edge case, but we log it
                        }
                    }
                    catch (Exception authEx)
                    {
                        Console.WriteLine($"[Supabase Purge Exception] {authEx.Message}");
                    }
                }
                else
                {
                    Console.WriteLine("\n[DEVELOPMENT WARNING] Supabase ServiceRoleKey not configured in appsettings.json. DB data purged successfully, skipping Supabase Auth User delete.\n");
                }

                response.StatusCode = 1;
                response.StatusMessage = "Your account, video greetings, and all assets have been permanently wiped.";
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                response.StatusCode = 3;
                response.StatusMessage = "Account deletion failed: " + ex.Message;
                try { await _logService.LogAsync("ERROR", "LoginService", $"Permanently delete account transaction rollback for user {userId}: {ex.Message}", ex.ToString()); } catch {}
            }
            return response;
        }
    }
}

