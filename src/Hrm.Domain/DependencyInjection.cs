using Microsoft.Extensions.DependencyInjection;

namespace Hrm.Domain
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDomainLayer(this IServiceCollection services)
        {
            // Register domain services, events, or factories here if needed in the future
            return services;
        }
    }
}
