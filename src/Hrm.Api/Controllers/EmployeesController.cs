using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    /// <summary>
    /// Quản lý thông tin hồ sơ nhân viên, chức vụ và phòng ban.
    /// </summary>
    [Authorize(Roles = "Admin,Personnel,Manager")]
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public EmployeesController(HrmDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách nhân viên trong hệ thống.
        /// </summary>
        /// <returns>Danh sách nhân viên kèm thông tin phòng ban.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Account)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Account)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null) return NotFound();
            return employee;
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
        {
            var isAdmin = User.IsInRole("Admin") || User.HasClaim(c => c.Type == "Permission" && c.Value == "EMP_MANAGE_ALL");
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out var userId);

            if (!isAdmin)
            {
                var approval = new ApprovalRequest
                {
                    RequesterId = userId,
                    RequestType = "PERSONNEL_CREATE",
                    EntityName = "Employee",
                    DataJson = System.Text.Json.JsonSerializer.Serialize(employee),
                    Description = $"Thêm mới nhân viên: {employee.FullName}",
                    DepartmentId = employee.DepartmentId,
                    Status = ApprovalStatus.Pending
                };

                _context.ApprovalRequests.Add(approval);
                await _context.SaveChangesAsync();
                return Accepted(new { message = "Yêu cầu thêm mới đã được gửi để phê duyệt." });
            }

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id) return BadRequest();

            // Check if user is Admin
            var isAdmin = User.IsInRole("Admin") || User.HasClaim(c => c.Type == "Permission" && c.Value == "EMP_MANAGE_ALL");
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out var userId);

            if (!isAdmin)
            {
                // Create Approval Request instead
                var existing = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
                if (existing == null) return NotFound();

                var approval = new ApprovalRequest
                {
                    RequesterId = userId,
                    RequestType = "PERSONNEL_UPDATE",
                    EntityName = "Employee",
                    EntityId = id.ToString(),
                    DataJson = System.Text.Json.JsonSerializer.Serialize(employee),
                    Description = $"Cập nhật thông tin nhân viên {existing.FullName} (ID: {id})",
                    DepartmentId = existing.DepartmentId,
                    Status = ApprovalStatus.Pending
                };

                _context.ApprovalRequests.Add(approval);
                await _context.SaveChangesAsync();
                return Accepted(new { message = "Yêu cầu thay đổi đã được gửi để phê duyệt.", requestId = approval.Id });
            }

            var existingEmp = await _context.Employees.FindAsync(id);
            if (existingEmp == null) return NotFound();

            // Direct update for Admin
            _context.Entry(existingEmp).CurrentValues.SetValues(employee);
            existingEmp.Id = id;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportExcel([FromQuery] string? ids)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Account)
                .AsQueryable();

            if (!string.IsNullOrEmpty(ids))
            {
                var idList = ids.Split(',').Select(int.Parse).ToList();
                query = query.Where(e => idList.Contains(e.Id));
            }

            var employees = await query.ToListAsync();

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Employees");

            // Header
            worksheet.Cell(1, 1).Value = "Mã NV";
            worksheet.Cell(1, 2).Value = "Họ và Tên";
            worksheet.Cell(1, 3).Value = "Email";
            worksheet.Cell(1, 4).Value = "Số điện thoại";
            worksheet.Cell(1, 5).Value = "Giới tính";
            worksheet.Cell(1, 6).Value = "Ngày sinh";
            worksheet.Cell(1, 7).Value = "Phòng ban";
            worksheet.Cell(1, 8).Value = "Chức vụ";
            worksheet.Cell(1, 9).Value = "Lương cơ bản";

            var headerRow = worksheet.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

            int row = 2;
            foreach (var emp in employees)
            {
                worksheet.Cell(row, 1).Value = "NV" + emp.Id.ToString("D3");
                worksheet.Cell(row, 2).Value = emp.FullName;
                worksheet.Cell(row, 3).Value = emp.Email;
                worksheet.Cell(row, 4).Value = emp.PhoneNumber;
                worksheet.Cell(row, 5).Value = emp.Gender;
                worksheet.Cell(row, 6).Value = emp.DateOfBirth?.ToString("dd/MM/yyyy") ?? "";
                worksheet.Cell(row, 7).Value = emp.Department?.Name ?? "";
                worksheet.Cell(row, 8).Value = emp.Position;
                worksheet.Cell(row, 9).Value = emp.BaseSalary;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Employees.xlsx");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var isAdmin = User.IsInRole("Admin") || User.HasClaim(c => c.Type == "Permission" && c.Value == "EMP_MANAGE_ALL");
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out var userId);

            if (!isAdmin)
            {
                var approval = new ApprovalRequest
                {
                    RequesterId = userId,
                    RequestType = "PERSONNEL_DELETE",
                    EntityName = "Employee",
                    EntityId = id.ToString(),
                    Description = $"Xóa nhân viên {employee.FullName} (ID: {id})",
                    DepartmentId = employee.DepartmentId,
                    Status = ApprovalStatus.Pending
                };

                _context.ApprovalRequests.Add(approval);
                await _context.SaveChangesAsync();
                return Accepted(new { message = "Yêu cầu xóa nhân viên đã được gửi để phê duyệt." });
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("bulk-delete")]
        public async Task<IActionResult> DeleteEmployees([FromBody] List<int> ids)
        {
            var employees = await _context.Employees.Where(e => ids.Contains(e.Id)).ToListAsync();
            if (!employees.Any()) return NotFound();

            _context.Employees.RemoveRange(employees);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeExists(int id)
        {
            return _context.Employees.Any(e => e.Id == id);
        }
    }
}
