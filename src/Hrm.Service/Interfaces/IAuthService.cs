using Hrm.Domain.Entities;

namespace Hrm.Service.Interfaces
{
    public interface IAuthService
    {
        Task<string?> Login(string username, string password);
        Task<User?> GetUserByUsername(string username);
    }
}
