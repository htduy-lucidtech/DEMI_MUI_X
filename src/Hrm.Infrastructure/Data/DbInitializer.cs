using Hrm.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Hrm.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(HrmDbContext context)
        {
            if (context.Database.GetPendingMigrations().Any())
            {
                await context.Database.MigrateAsync();
            }

            if (context.Departments.Any())
            {
                return;
            }

            // 1. Seed Departments
            var departments = GetPreconfiguredDepartments();
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();

            // 2. Seed Employees
            var employees = GetPreconfiguredEmployees(departments);
            context.Employees.AddRange(employees);
            await context.SaveChangesAsync();

            // 3. Seed Permissions
            var permissions = GetPreconfiguredPermissions();
            context.Permissions.AddRange(permissions);
            await context.SaveChangesAsync();

            // 4. Seed Roles
            var roles = GetPreconfiguredRoles(permissions);
            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();

            // 5. Seed Users
            var users = GetPreconfiguredUsers(employees);
            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            // 6. Seed UserRoles
            var userRoles = GetPreconfiguredUserRoles(users, roles);
            context.UserRoles.AddRange(userRoles);
            await context.SaveChangesAsync();

            // 7. Seed Attendances
            var attendances = GetPreconfiguredAttendances(users);
            context.Attendances.AddRange(attendances);
            await context.SaveChangesAsync();

            // 8. Seed Leave Requests
            var leaveRequests = GetPreconfiguredLeaveRequests(users);
            context.LeaveRequests.AddRange(leaveRequests);
            await context.SaveChangesAsync();

            // 9. Seed System Settings
            var settings = GetPreconfiguredSettings();
            context.SystemSettings.AddRange(settings);
            await context.SaveChangesAsync();
        }

        private static List<Department> GetPreconfiguredDepartments()
        {
            var banGiamDoc = new Department { Name = "Ban Giám đốc", Description = "Lãnh đạo và quản lý chiến lược" };
            
            var phongNhanSu = new Department { Name = "Phòng Nhân sự", Description = "Quản lý nguồn nhân lực và văn hóa", Parent = banGiamDoc };
            var nhomTuyenDung = new Department { Name = "Nhóm Tuyển dụng", Description = "Tìm kiếm và thu hút tài năng", Parent = phongNhanSu };
            var nhomDaoTao = new Department { Name = "Nhóm Đào tạo & Văn hóa", Description = "Phát triển kỹ năng và văn hóa doanh nghiệp", Parent = phongNhanSu };

            var phongCongNghe = new Department { Name = "Phòng Công nghệ", Description = "Phát triển phần mềm và hạ tầng CNTT", Parent = banGiamDoc };
            var nhomFrontend = new Department { Name = "Nhóm Frontend", Description = "Phát triển giao diện người dùng", Parent = phongCongNghe };
            var nhomBackend = new Department { Name = "Nhóm Backend", Description = "Phát triển hệ thống và API", Parent = phongCongNghe };
            var nhomQA = new Department { Name = "Nhóm QA/QC", Description = "Đảm bảo chất lượng sản phẩm", Parent = phongCongNghe };

            var phongKinhDoanh = new Department { Name = "Phòng Kinh doanh", Description = "Kinh doanh và phát triển thị trường", Parent = banGiamDoc };
            var salesHN = new Department { Name = "Kinh doanh Miền Bắc", Description = "Thị trường Hà Nội và lân cận", Parent = phongKinhDoanh };
            var salesHCM = new Department { Name = "Kinh doanh Miền Nam", Description = "Thị trường TP.HCM và lân cận", Parent = phongKinhDoanh };

            var phongTaiChinh = new Department { Name = "Phòng Tài chính - Kế toán", Description = "Quản lý tài chính và ngân sách", Parent = banGiamDoc };

            return new List<Department> 
            { 
                banGiamDoc, 
                phongNhanSu, nhomTuyenDung, nhomDaoTao,
                phongCongNghe, nhomFrontend, nhomBackend, nhomQA,
                phongKinhDoanh, salesHN, salesHCM,
                phongTaiChinh
            };
        }

        private static List<Employee> GetPreconfiguredEmployees(List<Department> departments)
        {
            return new List<Employee>
            {
                new Employee 
                { 
                    FullName = "Nguyễn Hoàng Nam", Email = "admin@hrm.com", Position = "Giám đốc điều hành", 
                    DepartmentId = departments[0].Id, BaseSalary = 80000000, Allowance = 20000000,
                    HourlyRate = 454545, HourlyRateOT = 681818, 
                    PhoneNumber = "0901234567", Address = "Hoàn Kiếm, Hà Nội", Gender = "Male",
                    DateOfBirth = new DateTime(1980, 1, 1, 0, 0, 0, DateTimeKind.Utc), IdentityCardNumber = "ID-ADMIN-001"
                },
                new Employee 
                { 
                    FullName = "Phạm Thu Hương", Email = "gen_manager@hrm.com", Position = "Quản lý tổng thể", 
                    DepartmentId = departments[0].Id, BaseSalary = 50000000, Allowance = 10000000,
                    HourlyRate = 284090, HourlyRateOT = 426136,
                    PhoneNumber = "0901112222", Address = "Quận 1, TP.HCM", Gender = "Female",
                    DateOfBirth = new DateTime(1985, 5, 20, 0, 0, 0, DateTimeKind.Utc)
                },
                new Employee 
                { 
                    FullName = "Trần Tuấn Anh", Email = "dept_it@hrm.com", Position = "Quản lý Phòng Công nghệ", 
                    DepartmentId = departments[4].Id, BaseSalary = 40000000, Allowance = 5000000,
                    HourlyRate = 227272, HourlyRateOT = 340909,
                    PhoneNumber = "0907778888", Address = "Cầu Giấy, Hà Nội", Gender = "Male"
                },
                new Employee 
                { 
                    FullName = "Lê Minh Phương", Email = "dept_hr@hrm.com", Position = "Quản lý Phòng Nhân sự", 
                    DepartmentId = departments[1].Id, BaseSalary = 35000000, Allowance = 5000000,
                    HourlyRate = 198863, HourlyRateOT = 298295,
                    PhoneNumber = "0903334444", Address = "Hai Bà Trưng, Hà Nội", Gender = "Female"
                },
                new Employee 
                { 
                    FullName = "Phan Thùy Linh", Email = "emp_it@hrm.com", Position = "Lập trình viên Senior", 
                    DepartmentId = departments[5].Id, BaseSalary = 25000000, Allowance = 2000000,
                    HourlyRate = 142045, HourlyRateOT = 213068,
                    PhoneNumber = "0905556666", Address = "Thanh Xuân, Hà Nội", Gender = "Female"
                },
                new Employee 
                { 
                    FullName = "Lý Minh Triết", Email = "emp_hr@hrm.com", Position = "Chuyên viên Tuyển dụng", 
                    DepartmentId = departments[2].Id, BaseSalary = 18000000, Allowance = 2000000,
                    HourlyRate = 102272, HourlyRateOT = 153409,
                    PhoneNumber = "0909990000", Address = "Bình Thạnh, TP.HCM", Gender = "Male"
                }
            };
        }

        private static List<User> GetPreconfiguredUsers(List<Employee> employees)
        {
            return new List<User>
            {
                new User { Username = "admin", Password = "Password@123", Email = employees[0].Email, Role = "Admin", EmployeeId = employees[0].Id, IsActive = true },
                new User { Username = "gen_manager", Password = "Password@123", Email = employees[1].Email, Role = "General Manager", EmployeeId = employees[1].Id, IsActive = true },
                new User { Username = "dept_manager_it", Password = "Password@123", Email = employees[2].Email, Role = "Department Manager", EmployeeId = employees[2].Id, IsActive = true },
                new User { Username = "dept_manager_hr", Password = "Password@123", Email = employees[3].Email, Role = "Department Manager", EmployeeId = employees[3].Id, IsActive = true },
                new User { Username = "emp_it", Password = "Password@123", Email = employees[4].Email, Role = "Employee", EmployeeId = employees[4].Id, IsActive = true },
                new User { Username = "emp_hr", Password = "Password@123", Email = employees[5].Email, Role = "Employee", EmployeeId = employees[5].Id, IsActive = true }
            };
        }

        private static List<Permission> GetPreconfiguredPermissions()
        {
            return new List<Permission>
            {
                new Permission { Code = "USERS_VIEW", Name = "Xem danh sách tài khoản", Module = "UserManagement" },
                new Permission { Code = "USERS_MANAGE", Name = "Quản lý tài khoản", Module = "UserManagement" },
                new Permission { Code = "EMP_VIEW_ALL", Name = "Xem toàn bộ nhân sự", Module = "Personnel" },
                new Permission { Code = "EMP_MANAGE_ALL", Name = "Quản lý toàn bộ nhân sự", Module = "Personnel" },
                new Permission { Code = "ATT_VIEW_ALL", Name = "Xem chấm công toàn công ty", Module = "Attendance" },
                new Permission { Code = "ATT_MANAGE_ALL", Name = "Quản lý chấm công toàn công ty", Module = "Attendance" },
                new Permission { Code = "ATT_VIEW_DEPT", Name = "Xem chấm công phòng ban", Module = "Attendance" },
                new Permission { Code = "LEAVE_APPROVE", Name = "Phê duyệt nghỉ phép", Module = "Leave" },
                new Permission { Code = "APPROVE_ALL", Name = "Duyệt mọi yêu cầu", Module = "System" },
                new Permission { Code = "APPROVE_DEPT", Name = "Duyệt yêu cầu phòng ban", Module = "System" },
                new Permission { Code = "AUDIT_VIEW", Name = "Xem nhật ký hệ thống", Module = "System" }
            };
        }

        private static List<Role> GetPreconfiguredRoles(List<Permission> permissions)
        {
            var adminRole = new Role { Name = "Admin", Description = "Quản trị viên toàn quyền" };
            var genManagerRole = new Role { Name = "General Manager", Description = "Quản lý cấp cao - Toàn công ty" };
            var deptManagerRole = new Role { Name = "Department Manager", Description = "Quản lý phòng ban" };
            var employeeRole = new Role { Name = "Employee", Description = "Nhân viên thông thường" };

            // Admin: All
            foreach (var p in permissions) adminRole.RolePermissions.Add(new RolePermission { Permission = p });

            // General Manager: High access
            var genPerms = permissions.Where(p => !p.Code.Contains("USERS_MANAGE"));
            foreach (var p in genPerms) genManagerRole.RolePermissions.Add(new RolePermission { Permission = p });

            // Dept Manager: Scoped
            var deptPerms = permissions.Where(p => p.Code == "ATT_VIEW_DEPT" || p.Code == "LEAVE_APPROVE" || p.Code == "APPROVE_DEPT");
            foreach (var p in deptPerms) deptManagerRole.RolePermissions.Add(new RolePermission { Permission = p });

            return new List<Role> { adminRole, genManagerRole, deptManagerRole, employeeRole };
        }

        private static List<UserRole> GetPreconfiguredUserRoles(List<User> users, List<Role> roles)
        {
            var userRoles = new List<UserRole>();
            foreach (var u in users)
            {
                var role = roles.FirstOrDefault(r => r.Name == u.Role);
                if (role != null) userRoles.Add(new UserRole { UserId = u.Id, RoleId = role.Id });
            }
            return userRoles;
        }

        private static List<Attendance> GetPreconfiguredAttendances(List<User> users)
        {
            var attendances = new List<Attendance>();
            var random = new Random();
            foreach (var u in users)
            {
                for (int i = 1; i <= 5; i++)
                {
                    var date = DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(-i), DateTimeKind.Utc);
                    if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) continue;
                    attendances.Add(new Attendance
                    {
                        UserId = u.Id,
                        CheckInTime = date.AddHours(1).AddMinutes(random.Next(20, 45)),
                        CheckOutTime = date.AddHours(10).AddMinutes(random.Next(0, 30)),
                        IsLate = false,
                        WorkedMinutes = 480 + random.Next(0, 60),
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            return attendances;
        }

        private static List<LeaveRequest> GetPreconfiguredLeaveRequests(List<User> users)
        {
            return new List<LeaveRequest>
            {
                new LeaveRequest { UserId = users[4].Id, StartDate = DateTime.UtcNow.AddDays(2), EndDate = DateTime.UtcNow.AddDays(3), Reason = "Cần nghỉ ngơi", Status = "Pending", LeaveType = "Annual", CreatedAt = DateTime.UtcNow }
            };
        }

        private static List<SystemSetting> GetPreconfiguredSettings()
        {
            return new List<SystemSetting>
            {
                new SystemSetting { Key = "CompanyName", Value = "HRM Professional Solution", Category = "General" },
                new SystemSetting { Key = "WorkingTimeStart", Value = "08:30", Category = "Attendance" }
            };
        }
    }
}