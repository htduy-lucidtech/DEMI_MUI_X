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
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            // Lấy danh sách user kèm thông tin nhân sự (employee)
            var users = await _context.Users
                .Include(u => u.Employee)
                .Where(u => u.IsActive)
                .ToListAsync();

            var payrollList = new List<object>();

            foreach (var user in users)
            {
                if (user.Employee == null) continue;

                // Đếm số ngày đi làm trong tháng
                var workDays = await _context.Attendances
                    .CountAsync(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate);

                // Tính toán: Lương = (Lương cơ bản / 22 ngày công) * Số ngày thực tế + Phụ cấp
                decimal baseSalary = user.Employee.BaseSalary;
                decimal allowance = user.Employee.Allowance;
                
                decimal dailyRate = baseSalary / 22;
                decimal totalSalary = (workDays * dailyRate) + allowance;

                payrollList.Add(new
                {
                    UserId = user.Id,
                    FullName = user.Employee!.FullName,
                    BaseSalary = baseSalary,
                    Allowance = allowance,
                    WorkDays = workDays,
                    TotalSalary = Math.Round(totalSalary, 0)
                });
            }

            return Ok(payrollList);
        }
    }
}
