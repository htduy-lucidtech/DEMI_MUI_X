using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    /// <summary>
    /// Quản lý tài khoản người dùng và phân quyền hệ thống.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public UsersController(HrmDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tất cả người dùng hệ thống. (Yêu cầu quyền Admin hoặc Manager)
        /// </summary>
        /// <returns>Danh sách người dùng kèm thông tin nhân viên liên kết.</returns>
        [Authorize(Roles = "Admin,Manager")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            return await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.EmployeeId,
                    Employee = u.Employee != null ? new { u.Employee.FullName, u.Employee.Position } : null,
                    Roles = u.UserRoles.Select(ur => new { ur.Role.Id, ur.Role.Name })
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            return Ok(new {
                user.Id,
                user.Username,
                user.Email,
                user.Role,
                user.IsActive,
                user.EmployeeId,
                RoleIds = user.UserRoles.Select(ur => ur.RoleId).ToList()
            });
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(UserDto userDto)
        {
            var user = new User
            {
                Username = userDto.Username,
                Email = userDto.Email,
                Password = userDto.Password ?? "Password@123",
                Role = userDto.Role,
                IsActive = userDto.IsActive,
                EmployeeId = userDto.EmployeeId
            };

            if (userDto.RoleIds != null)
            {
                foreach (var roleId in userDto.RoleIds)
                {
                    user.UserRoles.Add(new UserRole { RoleId = roleId });
                }
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserDto userDto)
        {
            try
            {
                var existingUser = await _context.Users
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == id);
                    
                if (existingUser == null) return NotFound();

                // Update basic fields
                existingUser.Email = userDto.Email ?? existingUser.Email;
                existingUser.IsActive = userDto.IsActive;
                existingUser.Role = userDto.Role ?? existingUser.Role;
                existingUser.EmployeeId = userDto.EmployeeId != 0 ? userDto.EmployeeId : existingUser.EmployeeId;
                
                // Update roles
                _context.UserRoles.RemoveRange(existingUser.UserRoles);
                if (userDto.RoleIds != null)
                {
                    foreach (var roleId in userDto.RoleIds)
                    {
                        existingUser.UserRoles.Add(new UserRole { RoleId = roleId });
                    }
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("bulk-delete")]
        public async Task<IActionResult> DeleteUsers([FromBody] List<int> ids)
        {
            var users = await _context.Users.Where(u => ids.Contains(u.Id)).ToListAsync();
            if (!users.Any()) return NotFound();

            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound();

                // In a real app, you would verify the old password here
                // and hash the new password. For this demo, we just update.
                user.Password = request.NewPassword;
                user.SecurityScore = request.SecurityScore;
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message, stackTrace = ex.StackTrace });
            }
        }
    }

    public class UserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string Role { get; set; } = "Employee";
        public bool IsActive { get; set; } = true;
        public int EmployeeId { get; set; }
        public List<int>? RoleIds { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
        public int SecurityScore { get; set; }
    }
}
