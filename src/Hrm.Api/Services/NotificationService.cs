using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Hrm.Service.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Hrm.Api.Hubs;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly HrmDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(HrmDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<Notification> CreateAndSendAsync(Notification notification, string? role = null)
        {
            notification.CreatedAt = DateTime.UtcNow;
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var shortPayload = new { type = notification.Type, title = notification.Title, message = notification.Message };
            var fullPayload = new { id = notification.Id, type = notification.Type, title = notification.Title, message = notification.Message, meta = (object?)null };

            if (notification.UserId.HasValue)
            {
                var uid = notification.UserId.Value;
                await _hubContext.Clients.Group($"user-{uid}").SendAsync("ReceiveNotificationShort", shortPayload);
                await _hubContext.Clients.Group($"user-{uid}").SendAsync("ReceiveNotificationFull", fullPayload);
            }
            else if (!string.IsNullOrEmpty(role))
            {
                var users = await _context.Users.Where(u => u.Role == role && u.IsActive).ToListAsync();
                var userNotifications = users.Select(u => new Notification {
                    UserId = u.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    Type = notification.Type,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                if (userNotifications.Any())
                {
                    _context.Notifications.AddRange(userNotifications);
                    await _context.SaveChangesAsync();
                }

                await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationShort", shortPayload);
                await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationFull", fullPayload);
            }

            return notification;
        }

        public Task SendToUserGroupAsync(int userId, object shortPayload, object fullPayload)
        {
            return Task.WhenAll(
                _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotificationShort", shortPayload),
                _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotificationFull", fullPayload)
            );
        }

        public Task SendToRoleGroupAsync(string role, object shortPayload, object fullPayload)
        {
            return Task.WhenAll(
                _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationShort", shortPayload),
                _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationFull", fullPayload)
            );
        }
    }
}
