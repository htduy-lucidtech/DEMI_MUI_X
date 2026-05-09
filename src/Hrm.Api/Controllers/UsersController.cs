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
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users
                .Include(u => u.Employee)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                    .ThenInclude(e => e.Department)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();
            return user;
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            try
            {
                if (id != user.Id) return BadRequest("ID mismatch");
                
                var existingUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.Id == id);
                    
                if (existingUser == null) return NotFound();

                // Update basic fields
                existingUser.Email = user.Email ?? existingUser.Email;
                existingUser.Phone = user.Phone ?? existingUser.Phone;
                existingUser.IsActive = user.IsActive;
                existingUser.Role = user.Role ?? existingUser.Role;
                existingUser.EmployeeId = user.EmployeeId != 0 ? user.EmployeeId : existingUser.EmployeeId;
                
                // Update nested employee if provided
                if (user.Employee != null && existingUser.Employee != null)
                {
                    existingUser.Employee.FullName = user.Employee.FullName ?? existingUser.Employee.FullName;
                    existingUser.Employee.Email = existingUser.Email; // Sync email
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

    public class ChangePasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
        public int SecurityScore { get; set; }
    }
}
