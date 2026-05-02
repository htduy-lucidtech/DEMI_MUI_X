using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Hrm.Api.Hubs
{
    // Hub hỗ trợ nhóm theo role và user để gửi thông báo realtime ngắn/gọn và đầy đủ
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var user = Context.User;

            // Đăng ký connection vào nhóm theo user id (user-{id}) nếu có
            var idClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idClaim))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{idClaim}");
            }

            // Đăng ký connection vào nhóm theo role(s) (role-{roleName})
            var roles = user?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            if (roles != null)
            {
                foreach (var r in roles)
                {
                    if (!string.IsNullOrEmpty(r))
                        await Groups.AddToGroupAsync(Context.ConnectionId, $"role-{r}");
                }
            }

            await base.OnConnectedAsync();
        }

        public async Task SendNotification(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", user, message);
        }

        // Helper server-side method (invokable by server via IHubContext)
        public async Task SendToRole(string role, string shortMessage, string fullMessage)
        {
            await Clients.Group($"role-{role}").SendAsync("ReceiveNotificationShort", shortMessage);
            await Clients.Group($"role-{role}").SendAsync("ReceiveNotificationFull", fullMessage);
        }
    }
}
