using Dapper;
using Npgsql;

namespace Gretora.API.Services
{
    public class LogService
    {
        private readonly DatabaseService _dbService;

        public LogService(DatabaseService dbService)
        {
            _dbService = dbService;
        }

        public async Task LogAsync(string level, string source, string message, string? details = null)
        {
            try
            {
                using var conn = _dbService.CreateConnection();
                const string sql = @"
                    INSERT INTO public.system_logs (level, source, message, details, created_at)
                    VALUES (@Level, @Source, @Message, @Details, now());";
                
                await conn.ExecuteAsync(sql, new 
                { 
                    Level = level, 
                    Source = source, 
                    Message = message, 
                    Details = details 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LogService Error] Failed to write log to DB: {ex.Message}");
            }
        }

        public async Task<IEnumerable<dynamic>> GetLogsAsync(int page = 1, int pageSize = 50, string? level = null, string? source = null, string? search = null)
        {
            using var conn = _dbService.CreateConnection();
            var sql = "SELECT id, level, source, message, details, created_at FROM public.system_logs WHERE 1=1";
            var parameters = new DynamicParameters();

            if (!string.IsNullOrEmpty(level))
            {
                sql += " AND level = @Level";
                parameters.Add("Level", level);
            }

            if (!string.IsNullOrEmpty(source))
            {
                sql += " AND source = @Source";
                parameters.Add("Source", source);
            }

            if (!string.IsNullOrEmpty(search))
            {
                sql += " AND (message ILIKE @Search OR details ILIKE @Search)";
                parameters.Add("Search", $"%{search}%");
            }

            sql += " ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset";
            parameters.Add("Limit", pageSize);
            parameters.Add("Offset", (page - 1) * pageSize);

            return await conn.QueryAsync(sql, parameters);
        }

        public async Task<int> GetLogsCountAsync(string? level = null, string? source = null, string? search = null)
        {
            using var conn = _dbService.CreateConnection();
            var sql = "SELECT COUNT(*) FROM public.system_logs WHERE 1=1";
            var parameters = new DynamicParameters();

            if (!string.IsNullOrEmpty(level))
            {
                sql += " AND level = @Level";
                parameters.Add("Level", level);
            }

            if (!string.IsNullOrEmpty(source))
            {
                sql += " AND source = @Source";
                parameters.Add("Source", source);
            }

            if (!string.IsNullOrEmpty(search))
            {
                sql += " AND (message ILIKE @Search OR details ILIKE @Search)";
                parameters.Add("Search", $"%{search}%");
            }

            return await conn.ExecuteScalarAsync<int>(sql, parameters);
        }

        public async Task<int> PruneLogsAsync(int daysRetention = 60)
        {
            try
            {
                using var conn = _dbService.CreateConnection();
                const string sql = "DELETE FROM public.system_logs WHERE created_at < now() - CAST(@Interval AS INTERVAL);";
                return await conn.ExecuteAsync(sql, new { Interval = $"{daysRetention} days" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LogService Prune Error] Failed to prune logs: {ex.Message}");
                return 0;
            }
        }
    }
}
