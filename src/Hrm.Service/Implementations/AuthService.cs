using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Hrm.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Hrm.Service.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly HrmDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(HrmDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string?> Login(string username, string password)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r!.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Username == username && u.Password == password);
                
            if (user == null) return null;

            return GenerateJwtToken(user);
        }

        public async Task<User?> GetUserByUsername(string username)
        {
            return await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role), // Keep primary role string
                new Claim("Email", user.Email),
                new Claim("FullName", user.Employee?.FullName ?? user.Username)
            };

            // Add Permissions from all roles
            if (user.UserRoles != null)
            {
                var permissions = user.UserRoles
                    .Where(ur => ur.Role != null && (ur.ExpiryDate == null || ur.ExpiryDate > DateTime.UtcNow))
                    .SelectMany(ur => ur.Role!.RolePermissions)
                    .Where(rp => rp.Permission != null)
                    .Select(rp => rp.Permission!.Code)
                    .Distinct();

                foreach (var perm in permissions)
                {
                    claims.Add(new Claim("Permission", perm));
                }

                // Also add each role as a standard role claim
                foreach (var ur in user.UserRoles.Where(ur => ur.Role != null))
                {
                    claims.Add(new Claim(ClaimTypes.Role, ur.Role!.Name));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
