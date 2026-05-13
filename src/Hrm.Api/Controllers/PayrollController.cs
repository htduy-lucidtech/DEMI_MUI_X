using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Hrm.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PayrollController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public PayrollController(HrmDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin,Manager,Personnel")]
        [HttpGet("calculate/{month}/{year}")]
        public async Task<IActionResult> CalculateSalary(int month, int year)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);

            var users = await _context.Users
                .Include(u => u.Employee)
                .Where(u => u.IsActive)
                .ToListAsync();

            var payrollList = new List<object>();

            foreach (var user in users)
            {
                if (user.Employee == null) continue;

                // 1. Tổng hợp dữ liệu Chấm công
                var attendances = await _context.Attendances
                    .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                    .ToListAsync();

                int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
                int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
                int totalLateMinutes = attendances.Sum(a => a.LateMinutes ?? 0);
                int totalEarlyMinutes = attendances.Sum(a => a.EarlyMinutes ?? 0);
                int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

                // 2. Tổng hợp dữ liệu Nghỉ phép (Approved)
                var leaveRequests = await _context.LeaveRequests
                    .Where(l => l.UserId == user.Id && l.Status == "Approved" && l.StartDate <= endDate && l.EndDate >= startDate)
                    .ToListAsync();

                double leavePaidHours = 0;
                foreach (var leave in leaveRequests)
                {
                    // Tính số ngày nghỉ trong tháng này
                    var actualStart = leave.StartDate < startDate ? startDate : leave.StartDate;
                    var actualEnd = leave.EndDate > endDate ? endDate : leave.EndDate;
                    var days = (actualEnd - actualStart).TotalDays + 1;
                    
                    // Giả định mỗi ngày nghỉ tương ứng 8 giờ công nếu là phép năm/ốm
                    if (leave.LeaveType == "Annual" || leave.LeaveType == "Sick")
                    {
                        leavePaidHours += days * 8;
                    }
                }

                // 3. Tính toán Lương
                decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
                decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
                decimal allowance = user.Employee.Allowance;
                
                decimal standardSalary = ((totalStandardMinutes / 60m) + (decimal)leavePaidHours) * hourlyRate;
                decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
                
                // Khấu trừ đi muộn/về sớm (theo lương giờ)
                decimal deductionLateEarly = ((totalLateMinutes + totalEarlyMinutes) / 60m) * hourlyRate;
                
                decimal grossSalary = standardSalary + otSalary + allowance;
                decimal totalSalary = grossSalary - deductionLateEarly;

                payrollList.Add(new
                {
                    UserId = user.Id,
                    FullName = user.Employee!.FullName,
                    BaseSalary = user.Employee.BaseSalary,
                    HourlyRate = Math.Round(hourlyRate, 0),
                    Allowance = allowance,
                    WorkHours = Math.Round(totalStandardMinutes / 60.0, 1),
                    LeaveHours = Math.Round(leavePaidHours, 1),
                    OtHours = Math.Round(totalOtMinutes / 60.0, 1),
                    LateEarlyMinutes = totalLateMinutes + totalEarlyMinutes,
                    Deductions = Math.Round(deductionLateEarly, 0),
                    TotalSalary = Math.Round(totalSalary, 0)
                });
            }

            return Ok(payrollList);
        }

        [Authorize(Roles = "Admin,Manager,Personnel")]
        [HttpGet("export/excel/{month}/{year}")]
        public async Task<IActionResult> ExportExcel(int month, int year)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);

            var users = await _context.Users
                .Include(u => u.Employee)
                .Where(u => u.IsActive)
                .ToListAsync();

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add($"Payroll_{month}_{year}");
            
            // Header
            worksheet.Cell(1, 1).Value = "Nhân viên";
            worksheet.Cell(1, 2).Value = "Lương/Giờ";
            worksheet.Cell(1, 3).Value = "Giờ công";
            worksheet.Cell(1, 4).Value = "Giờ nghỉ (P)";
            worksheet.Cell(1, 5).Value = "Giờ OT";
            worksheet.Cell(1, 6).Value = "Khấu trừ";
            worksheet.Cell(1, 7).Value = "Phụ cấp";
            worksheet.Cell(1, 8).Value = "Thành tiền";
            
            var headerRow = worksheet.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

            int row = 2;
            foreach (var user in users)
            {
                if (user.Employee == null) continue;
                
                // 1. Chấm công
                var attendances = await _context.Attendances
                    .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                    .ToListAsync();

                int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
                int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
                int totalLateMinutes = attendances.Sum(a => a.LateMinutes ?? 0);
                int totalEarlyMinutes = attendances.Sum(a => a.EarlyMinutes ?? 0);
                int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

                // 2. Nghỉ phép
                var leaveRequests = await _context.LeaveRequests
                    .Where(l => l.UserId == user.Id && l.Status == "Approved" && l.StartDate <= endDate && l.EndDate >= startDate)
                    .ToListAsync();

                double leavePaidHours = 0;
                foreach (var leave in leaveRequests)
                {
                    var actualStart = leave.StartDate < startDate ? startDate : leave.StartDate;
                    var actualEnd = leave.EndDate > endDate ? endDate : leave.EndDate;
                    var days = (actualEnd - actualStart).TotalDays + 1;
                    if (leave.LeaveType == "Annual" || leave.LeaveType == "Sick") leavePaidHours += days * 8;
                }

                // 3. Tính toán
                decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
                decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
                decimal allowance = user.Employee.Allowance;
                
                decimal standardSalary = ((totalStandardMinutes / 60m) + (decimal)leavePaidHours) * hourlyRate;
                decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
                decimal deductionLateEarly = ((totalLateMinutes + totalEarlyMinutes) / 60m) * hourlyRate;
                decimal totalSalary = Math.Round(standardSalary + otSalary + allowance - deductionLateEarly, 0);

                worksheet.Cell(row, 1).Value = user.Employee.FullName;
                worksheet.Cell(row, 2).Value = Math.Round(hourlyRate, 0);
                worksheet.Cell(row, 3).Value = Math.Round(totalStandardMinutes / 60.0, 1);
                worksheet.Cell(row, 4).Value = Math.Round(leavePaidHours, 1);
                worksheet.Cell(row, 5).Value = Math.Round(totalOtMinutes / 60.0, 1);
                worksheet.Cell(row, 6).Value = Math.Round(deductionLateEarly, 0);
                worksheet.Cell(row, 7).Value = allowance;
                worksheet.Cell(row, 8).Value = totalSalary;
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
            var endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);

            // 1. Dữ liệu Chấm công
            var attendances = await _context.Attendances
                .Where(a => a.UserId == user.Id && a.CheckInTime >= startDate && a.CheckInTime <= endDate && a.CheckOutTime != null)
                .ToListAsync();

            int totalWorkedMinutes = attendances.Sum(a => a.WorkedMinutes ?? 0);
            int totalOtMinutes = attendances.Sum(a => a.OtMinutes ?? 0);
            int totalLateMinutes = attendances.Sum(a => a.LateMinutes ?? 0);
            int totalEarlyMinutes = attendances.Sum(a => a.EarlyMinutes ?? 0);
            int totalStandardMinutes = totalWorkedMinutes - totalOtMinutes;

            // 2. Dữ liệu Nghỉ phép
            var leaveRequests = await _context.LeaveRequests
                .Where(l => l.UserId == user.Id && l.Status == "Approved" && l.StartDate <= endDate && l.EndDate >= startDate)
                .ToListAsync();

            double leavePaidHours = 0;
            foreach (var leave in leaveRequests)
            {
                var actualStart = leave.StartDate < startDate ? startDate : leave.StartDate;
                var actualEnd = leave.EndDate > endDate ? endDate : leave.EndDate;
                var days = (actualEnd - actualStart).TotalDays + 1;
                if (leave.LeaveType == "Annual" || leave.LeaveType == "Sick") leavePaidHours += days * 8;
            }

            // 3. Tính toán
            decimal hourlyRate = user.Employee.HourlyRate > 0 ? user.Employee.HourlyRate : (user.Employee.BaseSalary / 176);
            decimal hourlyRateOT = user.Employee.HourlyRateOT > 0 ? user.Employee.HourlyRateOT : (hourlyRate * 1.5m);
            decimal allowance = user.Employee.Allowance;
            
            decimal standardSalary = ((totalStandardMinutes / 60m) + (decimal)leavePaidHours) * hourlyRate;
            decimal otSalary = (totalOtMinutes / 60m) * hourlyRateOT;
            decimal deductionLateEarly = ((totalLateMinutes + totalEarlyMinutes) / 60m) * hourlyRate;
            decimal totalSalary = Math.Round(standardSalary + otSalary + allowance - deductionLateEarly, 0);

            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(QuestPDF.Helpers.PageSizes.A5);
                    page.Margin(1, QuestPDF.Infrastructure.Unit.Centimetre);
                    page.PageColor(QuestPDF.Helpers.Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Text($"PHIẾU LƯƠNG THÁNG {month}/{year}")
                        .SemiBold().FontSize(14).FontColor(QuestPDF.Helpers.Colors.Blue.Darken2);

                    page.Content().PaddingVertical(0.5f, QuestPDF.Infrastructure.Unit.Centimetre).Column(x =>
                    {
                        x.Item().Text($"Nhân viên: {user.Employee.FullName}").SemiBold();
                        x.Item().Text($"Phòng ban: {user.Employee.DepartmentId}");
                        x.Item().PaddingTop(5).LineHorizontal(1);
                        
                        x.Item().PaddingTop(5).Row(row => {
                            row.RelativeItem().Text("Số giờ công chuẩn:");
                            row.RelativeItem().AlignRight().Text($"{totalStandardMinutes / 60.0:N1} h");
                        });
                        x.Item().Row(row => {
                            row.RelativeItem().Text("Số giờ nghỉ phép (P):");
                            row.RelativeItem().AlignRight().Text($"{leavePaidHours:N1} h");
                        });
                        x.Item().Row(row => {
                            row.RelativeItem().Text("Số giờ OT:");
                            row.RelativeItem().AlignRight().Text($"{totalOtMinutes / 60.0:N1} h");
                        });
                        x.Item().Row(row => {
                            row.RelativeItem().Text("Tổng phút đi muộn/về sớm:");
                            row.RelativeItem().AlignRight().Text($"{totalLateMinutes + totalEarlyMinutes} m");
                        });

                        x.Item().PaddingTop(5).LineHorizontal(0.5f);
                        
                        x.Item().PaddingTop(5).Row(row => {
                            row.RelativeItem().Text("Lương cơ bản / Giờ:");
                            row.RelativeItem().AlignRight().Text($"{hourlyRate:N0} VNĐ");
                        });
                        x.Item().Row(row => {
                            row.RelativeItem().Text("Phụ cấp:");
                            row.RelativeItem().AlignRight().Text($"{allowance:N0} VNĐ");
                        });
                        x.Item().Row(row => {
                            row.RelativeItem().Text("Khấu trừ kỷ luật:");
                            row.RelativeItem().AlignRight().Text($"- {deductionLateEarly:N0} VNĐ").FontColor(QuestPDF.Helpers.Colors.Red.Medium);
                        });

                        x.Item().PaddingTop(10).Background(QuestPDF.Helpers.Colors.Grey.Lighten4).Padding(5).Row(row => {
                            row.RelativeItem().Text("THỰC LÃNH:").Bold().FontSize(12);
                            row.RelativeItem().AlignRight().Text($"{totalSalary:N0} VNĐ")
                                .Bold().FontSize(12).FontColor(QuestPDF.Helpers.Colors.Green.Darken2);
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Được tạo bởi hệ thống HRM Pro - ").FontSize(8);
                        x.Span(DateTime.Now.ToString("dd/MM/yyyy HH:mm")).FontSize(8);
                    });
                });
            });

            var pdf = document.GeneratePdf();
            return File(pdf, "application/pdf", $"Payslip_{user.Employee.FullName}_{month}_{year}.pdf");
        }
    }
}
