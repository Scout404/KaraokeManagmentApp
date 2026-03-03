namespace karaokeMan.Api.models
{
    public class Queue
    {
        public int id { get; set; }
        public int sessionId { get; set; }
        public string sessionName { get; set; }
        public DateTime createdAt { get; set; }
        public bool isActive { get; set; }
    }
}