namespace Gretora.API.Services
{
    public class LogCleanupWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LogCleanupWorker> _logger;

        public LogCleanupWorker(IServiceProvider serviceProvider, ILogger<LogCleanupWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Log Cleanup Worker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var logService = scope.ServiceProvider.GetRequiredService<LogService>();
                        _logger.LogInformation("Running daily log pruning (60 days retention)...");
                        int deletedCount = await logService.PruneLogsAsync(60);
                        _logger.LogInformation($"Log pruning completed. Deleted {deletedCount} old logs.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during log cleanup execution.");
                }

                // Run once every 24 hours
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
