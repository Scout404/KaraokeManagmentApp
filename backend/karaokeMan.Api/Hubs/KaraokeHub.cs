using Microsoft.AspNetCore.SignalR;

namespace KaraokeMan.Api.Hubs
{
    public class KaraokeHub : Hub
    {
        public async Task JoinDisplay()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "display");
        }
        
        public async Task JoinAdmin()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin");
        }
        
        public async Task QueueAdded()
        {
            await Clients.All.SendAsync("QueueUpdated");
        }
        
        public async Task QueueRemoved()
        {
            await Clients.All.SendAsync("QueueUpdated");
        }
        
        public async Task QueueNext()
        {
            await Clients.All.SendAsync("SingerCurrent");
            await Clients.All.SendAsync("QueueUpdated");
        }
        
        public async Task QueueReordered()
        {
            await Clients.All.SendAsync("QueueUpdated");
        }
    }
}
