namespace karaokeMan.Api.models
{
    public class User
    {
        public int id { get; set; }
        public string passwordHash { get; set; }
        public string email { get; set; }
        public string role { get; set; }
    }
}