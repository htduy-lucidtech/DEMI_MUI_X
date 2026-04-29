using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(HrmDbContext context)
        {
            // Reset database for fresh sample data
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // 1. Seed Departments
            var departments = new List<Department>
            {
                new Department { Name = "Ban Giám đốc", Description = "Lãnh đạo và quản lý chiến lược" },
                new Department { Name = "Phòng Nhân sự", Description = "Quản lý nguồn nhân lực và tuyển dụng" },
                new Department { Name = "Phòng Kỹ thuật", Description = "Phát triển phần mềm và hạ tầng CNTT" },
                new Department { Name = "Phòng Kinh doanh", Description = "Kinh doanh và phát triển thị trường" },
                new Department { Name = "Phòng Kế toán", Description = "Quản lý tài chính và thuế" }
            };
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();

            // 2. Seed Employees
            var employees = new List<Employee>
            {
                new Employee 
                { 
                    FullName = "Nguyễn Văn Admin", Email = "admin@hrm.com", Position = "Giám đốc hệ thống", 
                    DepartmentId = departments[0].Id, BaseSalary = 50000000, Allowance = 10000000,
                    PhoneNumber = "0901234567", Address = "Hà Nội", Gender = "Male",
                    DateOfBirth = new DateTime(1985, 1, 1, 0, 0, 0, DateTimeKind.Utc), IdentityCardNumber = "ID-ADMIN-001"
                },
                new Employee 
                { 
                    FullName = "Trần Thị Quản Lý", Email = "manager@hrm.com", Position = "Quản lý dự án", 
                    DepartmentId = departments[2].Id, BaseSalary = 35000000, Allowance = 5000000,
                    PhoneNumber = "0901112222", Address = "TP.HCM", Gender = "Female",
                    DateOfBirth = new DateTime(1988, 5, 12, 0, 0, 0, DateTimeKind.Utc)
                },
                new Employee 
                { 
                    FullName = "Lê Thị Nhân Sự", Email = "personnel@hrm.com", Position = "Trưởng phòng Nhân sự", 
                    DepartmentId = departments[1].Id, BaseSalary = 28000000, Allowance = 4000000,
                    PhoneNumber = "0903334444", Address = "Hải Phòng", Gender = "Female"
                },
                new Employee 
                { 
                    FullName = "Phạm Văn Chấm Công", Email = "attendance@hrm.com", Position = "Chuyên viên chấm công", 
                    DepartmentId = departments[1].Id, BaseSalary = 15000000, Allowance = 2000000,
                    PhoneNumber = "0905556666", Address = "Đà Nẵng", Gender = "Male"
                },
                new Employee 
                { 
                    FullName = "Hoàng Văn Nhân Viên", Email = "employee@hrm.com", Position = "Lập trình viên", 
                    DepartmentId = departments[2].Id, BaseSalary = 20000000, Allowance = 1000000,
                    PhoneNumber = "0907778888", Address = "Cần Thơ", Gender = "Male"
                },
                new Employee { FullName = "Bùi Văn Kế Toán", Email = "ketoan@hrm.com", Position = "Kế toán trưởng", DepartmentId = departments[4].Id, BaseSalary = 22000000 },
                new Employee { FullName = "Đỗ Thị Kinh Doanh", Email = "sales1@hrm.com", Position = "Nhân viên kinh doanh", DepartmentId = departments[3].Id, BaseSalary = 12000000 },
                new Employee { FullName = "Ngô Văn Bảo Vệ", Email = "security@hrm.com", Position = "Bảo vệ", DepartmentId = departments[0].Id, BaseSalary = 8000000 },
                new Employee { FullName = "Vũ Thị Tạp Vụ", Email = "cleaner@hrm.com", Position = "Tạp vụ", DepartmentId = departments[0].Id, BaseSalary = 7500000 },
                new Employee { FullName = "Lý Văn Lái Xe", Email = "driver@hrm.com", Position = "Lái xe", DepartmentId = departments[0].Id, BaseSalary = 10000000 }
            };
            context.Employees.AddRange(employees);
            await context.SaveChangesAsync();

            // 3. Seed 5 Main Users
            var users = new List<User>
            {
                new User { Username = "admin", Password = "Admin@123", Email = "admin@hrm.com", Role = "Admin", EmployeeId = employees[0].Id, IsActive = true },
                new User { Username = "manager", Password = "Manager@123", Email = "manager@hrm.com", Role = "Manager", EmployeeId = employees[1].Id, IsActive = true },
                new User { Username = "personnel", Password = "Personnel@123", Email = "personnel@hrm.com", Role = "Personnel", EmployeeId = employees[2].Id, IsActive = true },
                new User { Username = "attendance", Password = "Attendance@123", Email = "attendance@hrm.com", Role = "Attendance", EmployeeId = employees[3].Id, IsActive = true },
                new User { Username = "employee", Password = "Employee@123", Email = "employee@hrm.com", Role = "Employee", EmployeeId = employees[4].Id, IsActive = true }
            };
            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            // 4. Seed Attendances
            var attendances = new List<Attendance>();
            var random = new Random();
            var now = DateTime.UtcNow;
            
            foreach (var u in users)
            {
                // Seed for last 10 days, but NOT today
                for (int i = 1; i <= 10; i++)
                {
                    var date = now.AddDays(-i).Date;
                    if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) continue;

                    // Standard shift: 8:00 - 17:00 (UTC approx for demo)
                    // Let's use 1:00 AM UTC as 8:00 AM GMT+7
                    var checkIn = date.AddHours(1).AddMinutes(random.Next(0, 60));
                    var isLate = checkIn.TimeOfDay > new TimeSpan(1, 30, 0); // Late if after 8:30 AM GMT+7

                    attendances.Add(new Attendance
                    {
                        UserId = u.Id,
                        CheckInTime = checkIn,
                        CheckOutTime = date.AddHours(10).AddMinutes(random.Next(30, 60)), // 5:30 - 6:00 PM GMT+7
                        IsLate = isLate,
                        LateReason = isLate ? "Kẹt xe đường Nguyễn Trãi" : null,
                        Note = isLate ? "Đi muộn" : "Đúng giờ"
                    });
                }

                // For today: Some users are checked in, some are not
                var today = now.Date;
                if (today.DayOfWeek != DayOfWeek.Saturday && today.DayOfWeek != DayOfWeek.Sunday)
                {
                    if (u.Username == "employee")
                    {
                        // Employee is NOT checked in yet (demo manual check-in)
                    }
                    else if (u.Username == "admin")
                    {
                        // Admin is checked in but not out
                        attendances.Add(new Attendance
                        {
                            UserId = u.Id,
                            CheckInTime = today.AddHours(1).AddMinutes(15),
                            IsLate = false,
                            Note = "Admin đã vào hệ thống"
                        });
                    }
                    else
                    {
                        // Others are checked in
                        attendances.Add(new Attendance
                        {
                            UserId = u.Id,
                            CheckInTime = today.AddHours(1).AddMinutes(random.Next(0, 30)),
                            IsLate = false,
                            Note = "Đang làm việc"
                        });
                    }
                }
            }
            context.Attendances.AddRange(attendances);
            await context.SaveChangesAsync();

            // 5. Seed Leave Requests
            var leaveRequests = new List<LeaveRequest>
            {
                new LeaveRequest { 
                    UserId = users[4].Id, 
                    StartDate = DateTime.UtcNow.AddDays(2), 
                    EndDate = DateTime.UtcNow.AddDays(3), 
                    Reason = "Nghỉ ốm", 
                    Status = "Approved", 
                    LeaveType = "Sick Leave",
                    CreatedAt = DateTime.UtcNow
                },
                new LeaveRequest { 
                    UserId = users[1].Id, 
                    StartDate = DateTime.UtcNow.AddDays(5), 
                    EndDate = DateTime.UtcNow.AddDays(10), 
                    Reason = "Nghỉ phép năm", 
                    Status = "Pending", 
                    LeaveType = "Annual Leave",
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.LeaveRequests.AddRange(leaveRequests);
            await context.SaveChangesAsync(); // Lưu LeaveRequests riêng để dễ debug

            // 6. Seed Recruitment
            var jobs = new List<JobPosting>
            {
                new JobPosting { Title = ".NET Tech Lead", Department = "Kỹ thuật", Location = "Hà Nội", MinSalary = 3000, MaxSalary = 5000, Status = "Open", CreatedAt = DateTime.UtcNow, ExpiryDate = DateTime.UtcNow.AddDays(30) },
                new JobPosting { Title = "HR Manager", Department = "Nhân sự", Location = "TP.HCM", MinSalary = 2000, MaxSalary = 3000, Status = "Open", CreatedAt = DateTime.UtcNow, ExpiryDate = DateTime.UtcNow.AddDays(30) }
            };
            context.JobPostings.AddRange(jobs);
            await context.SaveChangesAsync();

            context.Candidates.AddRange(new List<Candidate>
            {
                new Candidate { FullName = "Ứng Viên Tiềm Năng", Email = "candidate@dev.com", Phone = "0123", JobPostingId = jobs[0].Id, Status = "Interviewing", AppliedAt = DateTime.UtcNow },
                new Candidate { FullName = "Nguyễn Văn Job", Email = "job@hr.com", Phone = "0456", JobPostingId = jobs[1].Id, Status = "New", AppliedAt = DateTime.UtcNow }
            });

            await context.SaveChangesAsync();

            // 7. Seed System Settings
            var settings = new List<SystemSetting>
            {
                new SystemSetting { Key = "SystemName", Value = "HRM Pro", Category = "General", Description = "Tên hệ thống" },
                new SystemSetting { Key = "LogoUrl", Value = "/logo.png", Category = "UI", Description = "Đường dẫn logo" },
                new SystemSetting { Key = "MaxLoginAttempts", Value = "5", Category = "Security", Description = "Số lần đăng nhập sai tối đa" },
                new SystemSetting { Key = "RequireStrongPassword", Value = "true", Category = "Security", Description = "Yêu cầu mật khẩu mạnh" },
                new SystemSetting { Key = "StandardCheckInTime", Value = "01:30", Category = "General", Description = "Giờ vào làm tiêu chuẩn" },
                new SystemSetting { Key = "StandardCheckOutTime", Value = "10:30", Category = "General", Description = "Giờ tan làm tiêu chuẩn" }
            };
            context.SystemSettings.AddRange(settings);

            // 8. Seed Performance Reviews
            var performanceReviews = new List<PerformanceReview>
            {
                new PerformanceReview 
                { 
                    EmployeeId = employees[4].Id, 
                    ReviewerId = employees[1].Id, 
                    ReviewDate = DateTime.UtcNow.AddDays(-10), 
                    WorkQuality = 4, 
                    Teamwork = 5, 
                    Punctuality = 4, 
                    TotalScore = 4.33m, 
                    Comments = "Hoàn thành tốt công việc được giao.", 
                    GoalsForNextPeriod = "Cải thiện kỹ năng giao tiếp", 
                    Status = "Completed" 
                },
                new PerformanceReview 
                { 
                    EmployeeId = employees[3].Id, 
                    ReviewerId = employees[2].Id, 
                    ReviewDate = DateTime.UtcNow.AddDays(-2), 
                    WorkQuality = 3, 
                    Teamwork = 4, 
                    Punctuality = 5, 
                    TotalScore = 4.0m, 
                    Comments = "Đi làm đúng giờ, cần chủ động hơn trong công việc.", 
                    GoalsForNextPeriod = "Hoàn thành chứng chỉ nhân sự", 
                    Status = "Pending" 
                }
            };
            context.PerformanceReviews.AddRange(performanceReviews);

            // 9. Seed Notifications
            var notifications = new List<Notification>
            {
                new Notification { UserId = employees[0].Id, Title = "Đơn nghỉ phép mới", Message = "Nguyễn Văn Employee vừa nộp đơn xin nghỉ phép.", Type = "Info", CreatedAt = DateTime.UtcNow.AddHours(-2) },
                new Notification { UserId = employees[0].Id, Title = "Lương đã duyệt", Message = "Bảng lương tháng này đã được duyệt.", Type = "Success", CreatedAt = DateTime.UtcNow.AddDays(-1) },
                new Notification { UserId = employees[1].Id, Title = "Họp phòng ban", Message = "Cuộc họp phòng IT lúc 14:00 hôm nay.", Type = "Warning", CreatedAt = DateTime.UtcNow.AddHours(-1) },
                new Notification { UserId = employees[4].Id, Title = "Đơn xin nghỉ được duyệt", Message = "Đơn xin nghỉ của bạn đã được duyệt.", Type = "Success", CreatedAt = DateTime.UtcNow.AddMinutes(-30) }
            };
            context.Notifications.AddRange(notifications);
            await context.SaveChangesAsync();

            // 10. Seed Contracts
            var contracts = new List<Contract>
            {
                new Contract { 
                    ContractNumber = "HD-001", Type = "Indefinite", 
                    StartDate = DateTime.UtcNow.AddYears(-1), Salary = 50000000, 
                    Status = "Active", EmployeeId = employees[0].Id 
                },
                new Contract { 
                    ContractNumber = "HD-002", Type = "Fixed-term", 
                    StartDate = DateTime.UtcNow.AddMonths(-6), EndDate = DateTime.UtcNow.AddMonths(6),
                    Salary = 35000000, Status = "Active", EmployeeId = employees[1].Id 
                },
                new Contract { 
                    ContractNumber = "HD-003", Type = "Fixed-term", 
                    StartDate = DateTime.UtcNow.AddMonths(-3), EndDate = DateTime.UtcNow.AddMonths(9),
                    Salary = 20000000, Status = "Active", EmployeeId = employees[4].Id 
                }
            };
            context.Contracts.AddRange(contracts);

            await context.SaveChangesAsync();
        }
    }
}
