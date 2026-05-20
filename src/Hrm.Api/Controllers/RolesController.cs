using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public bool SafeToAutoRun { get; private set; }

        public RolesController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRoles()
        {
            var roles = await _context.Roles
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    PermissionCount = r.RolePermissions.Count,
                    Permissions = r.RolePermissions.Select(rp => rp.Permission!.Code)
                })
                .ToListAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return NotFound();

            return Ok(new
            {
                role.Id,
                role.Name,
                role.Description,
                Permissions = role.RolePermissions.Select(rp => rp.Permission!.Code)
            });
        }

        [HttpGet("permissions")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions()
        {
            return await _context.Permissions.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Role>> CreateRole([FromBody] RoleDto roleDto)
        {
            var role = new Role
            {
                Name = roleDto.Name,
                Description = roleDto.Description
            };

            if (roleDto.Permissions != null)
            {
                var permissions = await _context.Permissions
                    .Where(p => roleDto.Permissions.Contains(p.Code))
                    .ToListAsync();

                foreach (var p in permissions)
                {
                    role.RolePermissions.Add(new RolePermission { Permission = p });
                }
            }

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleDto roleDto)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return NotFound();

            role.Name = roleDto.Name;
            role.Description = roleDto.Description;

            // Update permissions
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            
            if (roleDto.Permissions != null)
            {
                var permissions = await _context.Permissions
                    .Where(p => roleDto.Permissions.Contains(p.Code))
                    .ToListAsync();

                foreach (var p in permissions)
                {
                    role.RolePermissions.Add(new RolePermission { Permission = p });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound();

            // Check if any user is assigned to this role (optional safety check)
            var hasUsers = await _context.UserRoles.AnyAsync(ur => ur.RoleId == id);
            if (hasUsers)
            {
                return BadRequest(new { message = "Cannot delete role that has assigned users." });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class RoleDto
        {
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public List<string>? Permissions { get; set; }
        }
    }
}
