using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public SettingsController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<SystemSetting>> CreateSetting(SystemSetting setting)
        {
            _context.SystemSettings.Add(setting);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSettings), new { id = setting.Id }, setting);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSetting(int id, SystemSetting setting)
        {
            if (id != setting.Id)
            {
                return BadRequest();
            }

            _context.Entry(setting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SystemSettingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSetting(int id)
        {
            var setting = await _context.SystemSettings.FindAsync(id);
            if (setting == null) return NotFound();
            _context.SystemSettings.Remove(setting);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool SystemSettingExists(int id)
        {
            return _context.SystemSettings.Any(e => e.Id == id);
        }
    }
}
