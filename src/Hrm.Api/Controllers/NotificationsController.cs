using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Hrm.Api.Hubs;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly HrmDbContext _context;
        private readonly Hrm.Service.Interfaces.INotificationService _notificationService;

        public NotificationsController(HrmDbContext context, Hrm.Service.Interfaces.INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAllNotifications()
        {
            return await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // Get notifications for a user
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUserNotifications(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(notifications);
        }

        // Mark a notification as read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(int id, Notification notification)
        {
            if (id != notification.Id) return BadRequest();
            _context.Entry(notification).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Mark all notifications as read for a user
        [HttpPut("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Create a new notification (usually called internally by other services, but exposed for testing)
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification(Notification notification, [FromQuery] string? role = null)
        {
            // Delegate to notification service which saves and sends realtime events
            var created = await _notificationService.CreateAndSendAsync(notification, role);
            return CreatedAtAction(nameof(GetUserNotifications), new { userId = created.UserId }, created);
        }
    }
}
