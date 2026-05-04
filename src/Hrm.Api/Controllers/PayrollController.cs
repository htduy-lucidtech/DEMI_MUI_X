using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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

                // Tổng số phút làm việc trong tháng
                var attendances = await _context.Attendances
                    .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                    .ToListAsync();

                int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
                int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
                int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

                decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
                decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
                decimal allowance = user.Employee.Allowance;
                
                decimal standardSalary = (totalStandardMinutes / 60m) * hourlyRate;
                decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
                decimal totalSalary = standardSalary + otSalary + allowance;

                payrollList.Add(new
                {
                    UserId = user.Id,
                    FullName = user.Employee!.FullName,
                    BaseSalary = user.Employee.BaseSalary,
                    HourlyRate = hourlyRate,
                    Allowance = allowance,
                    WorkHours = Math.Round(totalStandardMinutes / 60.0, 1),
                    OtHours = Math.Round(totalOtMinutes / 60.0, 1),
                    TotalSalary = Math.Round(totalSalary, 0)
                });
            }

            return Ok(payrollList);
        }

        [HttpGet("export/excel/{month}/{year}")]
        public async Task<IActionResult> ExportExcel(int month, int year)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var users = await _context.Users
                .Include(u => u.Employee)
                .Where(u => u.IsActive)
                .ToListAsync();

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add($"Payroll_{month}_{year}");
            
            // Header
            worksheet.Cell(1, 1).Value = "Nhân viên";
            worksheet.Cell(1, 2).Value = "Lương/Giờ";
            worksheet.Cell(1, 3).Value = "Phụ cấp";
            worksheet.Cell(1, 4).Value = "Giờ công";
            worksheet.Cell(1, 5).Value = "Giờ OT";
            worksheet.Cell(1, 6).Value = "Thành tiền";
            var headerRow = worksheet.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

            int row = 2;
            foreach (var user in users)
            {
                if (user.Employee == null) continue;
                var attendances = await _context.Attendances
                    .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                    .ToListAsync();

                int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
                int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
                int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

                decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
                decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
                decimal allowance = user.Employee.Allowance;
                
                decimal standardSalary = (totalStandardMinutes / 60m) * hourlyRate;
                decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
                decimal totalSalary = Math.Round(standardSalary + otSalary + allowance, 0);

                worksheet.Cell(row, 1).Value = user.Employee.FullName;
                worksheet.Cell(row, 2).Value = hourlyRate;
                worksheet.Cell(row, 3).Value = allowance;
                worksheet.Cell(row, 4).Value = Math.Round(totalStandardMinutes / 60.0, 1);
                worksheet.Cell(row, 5).Value = Math.Round(totalOtMinutes / 60.0, 1);
                worksheet.Cell(row, 6).Value = totalSalary;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Payroll_{month}_{year}.xlsx");
        }

        [HttpGet("export/pdf/{userId}/{month}/{year}")]
        public async Task<IActionResult> ExportPdf(int userId, int month, int year)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

            var user = await _context.Users.Include(u => u.Employee).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.Employee == null) return NotFound();

            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var attendances = await _context.Attendances
                .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                .ToListAsync();

            int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
            int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
            int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

            decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
            decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
            decimal allowance = user.Employee.Allowance;
            
            decimal standardSalary = (totalStandardMinutes / 60m) * hourlyRate;
            decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
            decimal totalSalary = Math.Round(standardSalary + otSalary + allowance, 0);

            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(QuestPDF.Helpers.PageSizes.A5);
                    page.Margin(2, QuestPDF.Infrastructure.Unit.Centimetre);
                    page.PageColor(QuestPDF.Helpers.Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Text($"PHIẾU LƯƠNG THÁNG {month}/{year}")
                        .SemiBold().FontSize(16).FontColor(QuestPDF.Helpers.Colors.Blue.Darken2);

                    page.Content().PaddingVertical(1, QuestPDF.Infrastructure.Unit.Centimetre).Column(x =>
                    {
                        x.Item().Text($"Nhân viên: {user.Employee.FullName}").SemiBold();
                        x.Item().Text($"Phòng ban: {user.Employee.DepartmentId}");
                        x.Item().Text($"Số giờ công: {totalStandardMinutes / 60.0:N1}");
                        x.Item().Text($"Số giờ OT: {totalOtMinutes / 60.0:N1}");
                        x.Item().PaddingTop(10).Text($"Lương mỗi giờ: {hourlyRate:N0} VNĐ");
                        x.Item().Text($"Lương OT/giờ: {hourlyRateOT:N0} VNĐ");
                        x.Item().Text($"Phụ cấp: {allowance:N0} VNĐ");
                        x.Item().PaddingTop(10).Text($"THỰC LÃNH: {totalSalary:N0} VNĐ")
                            .Bold().FontSize(14).FontColor(QuestPDF.Helpers.Colors.Green.Darken2);
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Được tạo bởi hệ thống HRM Pro");
                    });
                });
            });

            var pdf = document.GeneratePdf();
            return File(pdf, "application/pdf", $"Payslip_{user.Employee.FullName}_{month}_{year}.pdf");
        }
    }
}
