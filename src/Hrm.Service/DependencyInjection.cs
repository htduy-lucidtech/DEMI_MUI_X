using Hrm.Service.Implementations;
using Hrm.Service.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Hrm.Service
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddServiceLayer(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAttendanceService, AttendanceService>();
            
            return services;
        }
    }
}
