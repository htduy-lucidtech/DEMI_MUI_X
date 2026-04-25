using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayrollController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public PayrollController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet("calculate/{month}/{year}")]
        public async Task<IActionResult> CalculateSalary(int month, int year)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var users = await _context.Users.Where(u => u.IsActive).ToListAsync();
            var payrollList = new List<object>();

            foreach (var user in users)
            {
                // Đếm số ngày đi làm trong tháng
                var workDays = await _context.Attendances
                    .CountAsync(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate);

                // Tính toán đơn giản: Lương = (Lương cơ bản / 22 ngày công chuẩn) * Số ngày thực tế
                decimal dailyRate = user.BaseSalary / 22;
                decimal totalSalary = workDays * dailyRate;

                payrollList.Add(new
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    BaseSalary = user.BaseSalary,
                    WorkDays = workDays,
                    TotalSalary = Math.Round(totalSalary, 0)
                });
            }

            return Ok(payrollList);
        }
    }
}
