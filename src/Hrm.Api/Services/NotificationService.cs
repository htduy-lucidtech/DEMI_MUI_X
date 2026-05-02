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
            // Always create a new entity instance to persist to avoid re-using a previously-saved instance
            var toSave = new Notification
            {
                UserId = notification.UserId,
                Role = notification.Role,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                MetaJson = notification.MetaJson,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(toSave);
            Console.WriteLine($"[NotificationService] Saving primary notification (Id before save = {toSave.Id}) Title={toSave.Title} UserId={toSave.UserId}");
            await _context.SaveChangesAsync();
            Console.WriteLine($"[NotificationService] Saved primary notification (Id after save = {toSave.Id})");

            var shortPayload = new { type = toSave.Type, title = toSave.Title, message = toSave.Message };
            object? meta = null;
            if (!string.IsNullOrEmpty(toSave.MetaJson))
            {
                try
                {
                    meta = System.Text.Json.JsonSerializer.Deserialize<object>(toSave.MetaJson);
                }
                catch { meta = toSave.MetaJson; }
            }
            var fullPayload = new { id = toSave.Id, type = toSave.Type, title = toSave.Title, message = toSave.Message, meta };

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
                    Title = toSave.Title,
                    Message = toSave.Message,
                    Type = toSave.Type,
                    MetaJson = toSave.MetaJson,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                if (userNotifications.Any())
                {
                    Console.WriteLine($"[NotificationService] Creating {userNotifications.Count} user notifications for role={role}");
                    for (int i = 0; i < userNotifications.Count; i++)
                    {
                        Console.WriteLine($"  userNotif[{i}] Id={userNotifications[i].Id} UserId={userNotifications[i].UserId} Title={userNotifications[i].Title}");
                    }
                    _context.Notifications.AddRange(userNotifications);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[NotificationService] Saved {userNotifications.Count} user notifications");
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
