namespace Scandy.API.Response.UserResponse
{
    public class GetProfileDashboardResponse : CommonStatusResponse
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public DateTime CreatedAt { get; set; }

        public int GreetingsCount { get; set; }

        public int VideosCount { get; set; }

        public List<RecentGreetingModel> RecentGreetings { get; set; }
    }

    public class RecentGreetingModel
    {
        public string Title { get; set; }

        public string Occassion { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
