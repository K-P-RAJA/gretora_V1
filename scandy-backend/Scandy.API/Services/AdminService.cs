using Dapper;
using Scandy.API.Models;
using System.Data;

namespace Scandy.API.Services
{
    public class AdminService
    {
        private readonly DatabaseService _db;
        private readonly R2Service _r2Service;

        public AdminService(DatabaseService db, R2Service r2Service)
        {
            _db = db;
            _r2Service = r2Service;
        }

        // =========================================
        // ADMIN CHECK
        // =========================================
        public async Task<bool> IsAdmin(Guid userId)
        {
            using var dbConnection = _db.CreateConnection();
            var sql = "SELECT is_admin FROM profiles WHERE id = @Id";
            return await dbConnection.ExecuteScalarAsync<bool>(sql, new { Id = userId });
        }

        // =========================================
        // DASHBOARD STATS
        // =========================================
        public async Task<dynamic> GetDashboardStats()
        {
            using var dbConnection = _db.CreateConnection();

            var totalUsers = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM profiles");
            var totalGreetings = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM greetings");
            var totalVideos = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM videos");

            var pendingReports = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reports WHERE status = 'Pending'");
            var reviewedReports = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reports WHERE status = 'Reviewed'");
            var rejectedReports = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reports WHERE status = 'Rejected'");
            var removedReports = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reports WHERE status = 'Removed'");

            // Quick user growth (last 7 days)
            var usersGrowth = await dbConnection.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days'"
            );

            // Safe QR Analytics (failsafe if migrations haven't run yet)
            int totalQrCodes = 0;
            int totalScans = 0;
            IEnumerable<dynamic> recentScans = new List<dynamic>();
            IEnumerable<dynamic> topCountries = new List<dynamic>();

            try
            {
                totalQrCodes = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM qr_codes");
                totalScans = await dbConnection.ExecuteScalarAsync<int>("SELECT COALESCE(SUM(scan_count), 0) FROM qr_codes");

                recentScans = await dbConnection.QueryAsync<dynamic>(@"
                    SELECT 
                        sl.id AS Id,
                        sl.scanned_at AS ScannedAt,
                        sl.country_code AS CountryCode,
                        g.title AS GreetingTitle
                    FROM scan_logs sl
                    LEFT JOIN qr_codes qc ON sl.qr_id = qc.id
                    LEFT JOIN greetings g ON qc.video_id = g.video_id
                    ORDER BY sl.scanned_at DESC
                    LIMIT 5
                ");

                topCountries = await dbConnection.QueryAsync<dynamic>(@"
                    SELECT 
                        country_code AS CountryCode, 
                        COUNT(*) AS ScanCount
                    FROM scan_logs
                    GROUP BY country_code
                    ORDER BY ScanCount DESC
                    LIMIT 3
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Dashboard API warning] qr_codes or scan_logs tables not ready: {ex.Message}");
            }

            // Support Tickets analytics (failsafe)
            int pendingTickets = 0;
            int totalTickets = 0;
            try
            {
                pendingTickets = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM support_tickets WHERE status = 'Pending'");
                totalTickets = await dbConnection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM support_tickets");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Dashboard API warning] support_tickets table not ready: {ex.Message}");
            }

            return new
            {
                TotalUsers = totalUsers,
                TotalGreetings = totalGreetings,
                TotalVideos = totalVideos,
                UsersGrowth = usersGrowth,
                TotalQrCodes = totalQrCodes,
                TotalScans = totalScans,
                RecentScans = recentScans,
                TopCountries = topCountries,
                Reports = new
                {
                    Pending = pendingReports,
                    Reviewed = reviewedReports,
                    Rejected = rejectedReports,
                    Removed = removedReports,
                    Total = pendingReports + reviewedReports + rejectedReports + removedReports
                },
                Tickets = new
                {
                    Pending = pendingTickets,
                    Total = totalTickets
                }
            };
        }

        // =========================================
        // REPORTS MANAGEMENT
        // =========================================
        public async Task<IEnumerable<dynamic>> GetAllReports(string? status)
        {
            using var dbConnection = _db.CreateConnection();

            var sql = @"
                SELECT 
                    r.id AS Id,
                    r.greeting_id AS GreetingId,
                    r.reason AS Reason,
                    r.details AS Details,
                    r.reported_at AS ReportedAt,
                    r.status AS Status,
                    g.title AS GreetingTitle,
                    p.name AS CreatorName,
                    p.email AS CreatorEmail,
                    v.file_path AS VideoPath
                FROM reports r
                LEFT JOIN greetings g ON r.greeting_id = g.id
                LEFT JOIN profiles p ON g.user_id = p.id
                LEFT JOIN videos v ON g.video_id = v.id
            ";

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                sql += " WHERE r.status = @Status";
            }

            sql += " ORDER BY r.reported_at DESC";

            var result = await dbConnection.QueryAsync<dynamic>(sql, new { Status = status });
            var reportsList = new List<dynamic>();

            foreach (var item in result)
            {
                string? signedUrl = null;
                string? filePath = item.videopath; // Npgsql lowecases dynamic column names
                string? rStatus = item.status;

                // Enforce report-locked privacy guard: only sign and provide videoUrl if report is PENDING
                if (!string.IsNullOrEmpty(filePath) && rStatus == "Pending")
                {
                    try
                    {
                        signedUrl = _r2Service.GetSignedUrl(filePath);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[R2 ERROR] Failed to sign path {filePath}: {ex.Message}");
                    }
                }

                reportsList.Add(new
                {
                    Id = item.id,
                    GreetingId = item.greetingid,
                    Reason = item.reason,
                    Details = item.details,
                    ReportedAt = item.reportedat,
                    Status = rStatus,
                    GreetingTitle = item.greetingtitle,
                    CreatorName = item.creatorname,
                    CreatorEmail = item.creatoremail,
                    VideoUrl = signedUrl
                });
            }

            return reportsList;
        }

        public async Task<bool> UpdateReportStatus(Guid reportId, string status)
        {
            using var dbConnection = _db.CreateConnection();
            var sql = "UPDATE reports SET status = @Status WHERE id = @ReportId";
            var rows = await dbConnection.ExecuteAsync(sql, new { ReportId = reportId, Status = status });
            return rows > 0;
        }

        // =========================================
        // USER MANAGEMENT
        // =========================================
        public async Task<IEnumerable<dynamic>> GetAllUsers(string? search)
        {
            using var dbConnection = _db.CreateConnection();

            var sql = @"
                SELECT 
                    p.id AS Id,
                    p.name AS Name,
                    p.email AS Email,
                    p.has_accepted_policy AS HasAcceptedPolicy,
                    p.is_admin AS IsAdmin,
                    p.is_banned AS IsBanned,
                    p.created_at AS CreatedAt,
                    (SELECT COUNT(*) FROM greetings g WHERE g.user_id = p.id) AS GreetingsCount,
                    (SELECT COUNT(*) FROM videos v WHERE v.user_id = p.id) AS VideosCount
                FROM profiles p
            ";

            if (!string.IsNullOrEmpty(search))
            {
                sql += " WHERE p.name ILIKE @Search OR p.email ILIKE @Search";
            }

            sql += " ORDER BY p.created_at DESC";

            var formattedSearch = $"%{search}%";
            return await dbConnection.QueryAsync<dynamic>(sql, new { Search = formattedSearch });
        }

        public async Task<bool> UpdateUserBanStatus(Guid userId, bool isBanned)
        {
            using var dbConnection = _db.CreateConnection();
            var sql = "UPDATE profiles SET is_banned = @IsBanned WHERE id = @UserId";
            var rows = await dbConnection.ExecuteAsync(sql, new { UserId = userId, IsBanned = isBanned });
            return rows > 0;
        }

        // =========================================
        // GREETINGS MANAGEMENT
        // =========================================
        public async Task<IEnumerable<dynamic>> GetAllGreetings(string? search)
        {
            using var dbConnection = _db.CreateConnection();

            var sql = @"
                SELECT 
                    g.id AS Id,
                    g.title AS Title,
                    g.occassion AS Occasion,
                    g.receiptant_name AS Recipient,
                    g.created_at AS CreatedAt,
                    p.name AS CreatorName,
                    p.email AS CreatorEmail,
                    (SELECT COUNT(*) FROM reports r WHERE r.greeting_id = g.id) AS ReportsCount
                FROM greetings g
                LEFT JOIN profiles p ON g.user_id = p.id
            ";

            if (!string.IsNullOrEmpty(search))
            {
                sql += " WHERE g.title ILIKE @Search OR g.receiptant_name ILIKE @Search OR p.name ILIKE @Search";
            }

            sql += " ORDER BY g.created_at DESC";

            var formattedSearch = $"%{search}%";
            var result = await dbConnection.QueryAsync<dynamic>(sql, new { Search = formattedSearch });

            var greetingsList = new List<dynamic>();
            foreach (var item in result)
            {
                greetingsList.Add(new
                {
                    Id = item.id,
                    Title = item.title,
                    Occasion = item.occasion,
                    Recipient = item.recipient,
                    CreatedAt = item.createdat,
                    CreatorName = item.creatorname,
                    CreatorEmail = item.creatoremail,
                    VideoUrl = (string?)null, // Hardlocked to null for maximum user privacy in the main catalog
                    ReportsCount = item.reportscount
                });
            }

            return greetingsList;
        }

        // =========================================
        // DELETE GREETING ADMIN
        // =========================================
        public async Task<bool> DeleteGreetingAdmin(Guid greetingId)
        {
            using var dbConnection = _db.CreateConnection();

            // Fetch the existing greeting to get the video_id and file_path
            var greeting = await dbConnection.QueryFirstOrDefaultAsync<dynamic>(
                @"
                SELECT g.video_id, v.file_path
                FROM greetings g
                LEFT JOIN videos v ON g.video_id = v.id
                WHERE g.id = @GreetingId;
                ",
                new { GreetingId = greetingId }
            );

            if (greeting == null)
                return false;

            // Update any reports associated with this greeting to 'Removed' status before cascading delete (or let cascade take care of it)
            // Note: Since reports has ON DELETE CASCADE on greeting_id, a direct DELETE from greetings will cascade delete them.
            // But if we want to change report status to 'Removed' instead, we can do that first if we wanted to preserve them.
            // Since the foreign key is NOT nullable, cascade delete is the only clean option without database modification.
            // So we'll let cascade delete handle it.

            // Delete greeting
            await dbConnection.ExecuteAsync(
                "DELETE FROM greetings WHERE id = @GreetingId;",
                new { GreetingId = greetingId }
            );

            // --- Clean Up associated QR Code record & scan logs ---
            try
            {
                var greetingIdString = greetingId.ToString();
                // Manually delete logs first to be completely foreign key compliant, regardless of cascade config
                await dbConnection.ExecuteAsync(@"
                    DELETE FROM scan_logs 
                    WHERE qr_id IN (SELECT id FROM qr_codes WHERE watch_url LIKE '%' || @GreetingIdString || '%');
                    
                    DELETE FROM qr_codes 
                    WHERE watch_url LIKE '%' || @GreetingIdString || '%';
                ", new { GreetingIdString = greetingIdString });
            }
            catch (Exception qrEx)
            {
                Console.WriteLine($"[Admin QR Delete Warning] Failed to delete QR record: {qrEx.Message}");
            }
            // ------------------------------------------

            // Check if video is still used by other greetings
            if (greeting.video_id != null)
            {
                var usageCount = await dbConnection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM greetings WHERE video_id = @VideoId;",
                    new { VideoId = greeting.video_id }
                );

                if (usageCount == 0)
                {
                    // Delete DB video row
                    await dbConnection.ExecuteAsync(
                        "DELETE FROM videos WHERE id = @VideoId;",
                        new { VideoId = greeting.video_id }
                    );

                    // Delete from R2
                    if (!string.IsNullOrEmpty(greeting.file_path))
                    {
                        try
                        {
                            await _r2Service.DeleteFile((string)greeting.file_path);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[R2 ERROR] Failed to delete file {(string)greeting.file_path}: {ex.Message}");
                        }
                    }
                }
            }

            return true;
        }

        // =========================================
        // SUPPORT TICKETS MANAGEMENT
        // =========================================
        public async Task<IEnumerable<dynamic>> GetSupportTickets()
        {
            using var dbConnection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    id AS Id,
                    name AS Name,
                    email AS Email,
                    subject AS Subject,
                    message AS Message,
                    status AS Status,
                    created_at AS CreatedAt
                FROM support_tickets
                ORDER BY created_at DESC;
            ";
            return await dbConnection.QueryAsync<dynamic>(sql);
        }

        public async Task<bool> UpdateTicketStatus(Guid ticketId, string status)
        {
            using var dbConnection = _db.CreateConnection();
            var sql = "UPDATE support_tickets SET status = @Status WHERE id = @TicketId";
            var rows = await dbConnection.ExecuteAsync(sql, new { TicketId = ticketId, Status = status });
            return rows > 0;
        }

        public async Task<bool> DeleteTicketAdmin(Guid ticketId)
        {
            using var dbConnection = _db.CreateConnection();
            var sql = "DELETE FROM support_tickets WHERE id = @TicketId";
            var rows = await dbConnection.ExecuteAsync(sql, new { TicketId = ticketId });
            return rows > 0;
        }
    }
}
