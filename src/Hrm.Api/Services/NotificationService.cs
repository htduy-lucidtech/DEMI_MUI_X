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
            try
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
                await _context.SaveChangesAsync();

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
                    try
                    {
                        await _hubContext.Clients.Group($"user-{uid}").SendAsync("ReceiveNotificationShort", shortPayload);
                        await _hubContext.Clients.Group($"user-{uid}").SendAsync("ReceiveNotificationFull", fullPayload);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[NotificationService] SignalR error (user-{uid}): {ex.Message}");
                    }
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
                        _context.Notifications.AddRange(userNotifications);
                        await _context.SaveChangesAsync();
                    }

                    try
                    {
                        await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationShort", shortPayload);
                        await _hubContext.Clients.Group($"role-{role}").SendAsync("ReceiveNotificationFull", fullPayload);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[NotificationService] SignalR error (role-{role}): {ex.Message}");
                    }
                }

                return notification;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NotificationService] Error in CreateAndSendAsync: {ex.Message}");
                // We still want the primary action (e.g. creating leave request) to succeed if notification fails
                // but if it's a DB error on saving notification, it might be better to let it fail or log it.
                // For now, we'll log it. 
                return notification;
            }
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
