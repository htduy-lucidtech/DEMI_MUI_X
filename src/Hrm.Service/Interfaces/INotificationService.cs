using Hrm.Domain.Entities;
namespace Hrm.Service.Interfaces
{
    public interface INotificationService
    {
        Task<Notification> CreateAndSendAsync(Notification notification, string? role = null);
        Task SendToUserGroupAsync(int userId, object shortPayload, object fullPayload);
        Task SendToRoleGroupAsync(string role, object shortPayload, object fullPayload);
    }
}
