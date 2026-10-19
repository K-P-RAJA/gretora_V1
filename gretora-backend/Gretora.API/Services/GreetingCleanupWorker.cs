namespace Gretora.API.Services
{
    public class GreetingCleanupWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<GreetingCleanupWorker> _logger;

        public GreetingCleanupWorker(IServiceProvider serviceProvider, ILogger<GreetingCleanupWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Greeting Cleanup Worker started.");

            await RunCleanupAsync("startup", stoppingToken);

            // Then run every 24 hours while the server is active
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);

                await RunCleanupAsync("daily", stoppingToken);
            }
        }

        private async Task RunCleanupAsync(string source, CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var greetingService = scope.ServiceProvider.GetRequiredService<GreetingService>();
                var result = await greetingService.RunRetentionCleanupAsync();
                _logger.LogInformation(
                    "{Source} greeting cleanup completed at {ExecutedAtUtc}. Retired {RetiredCount}, deleted {DeletedCount}, reclaimed {ReclaimedStorageBytes} bytes.",
                    source, result.ExecutedAtUtc, result.RetiredCount, result.DeletedCount, result.ReclaimedStorageBytes);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error during {Source} greeting cleanup", source);
            }
        }
    }
}
