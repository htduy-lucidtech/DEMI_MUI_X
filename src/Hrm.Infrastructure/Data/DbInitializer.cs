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
            // Apply any pending migrations
            if (context.Database.GetPendingMigrations().Any())
            {
                await context.Database.MigrateAsync();
            }

            // Check if already seeded
            if (context.Departments.Any())
            {
                return; // Database has been seeded
            }

            // 1. Seed Departments
            var departments = GetPreconfiguredDepartments();
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();

            // 2. Seed Employees
            var employees = GetPreconfiguredEmployees(departments);
            context.Employees.AddRange(employees);
            await context.SaveChangesAsync();

            // 3. Seed Users
            var users = GetPreconfiguredUsers(employees);
            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            // 4. Seed Attendances
            var attendances = GetPreconfiguredAttendances(users);
            context.Attendances.AddRange(attendances);
            await context.SaveChangesAsync();

            // 5. Seed Leave Requests
            var leaveRequests = GetPreconfiguredLeaveRequests(users);
            context.LeaveRequests.AddRange(leaveRequests);
            await context.SaveChangesAsync();

            // 6. Seed Recruitment
            var jobs = GetPreconfiguredJobs();
            context.JobPostings.AddRange(jobs);
            await context.SaveChangesAsync();

            var candidates = GetPreconfiguredCandidates(jobs);
            context.Candidates.AddRange(candidates);
            await context.SaveChangesAsync();

            // 7. Seed System Settings
            var settings = GetPreconfiguredSettings();
            context.SystemSettings.AddRange(settings);

            // 8. Seed Performance Reviews
            var reviews = GetPreconfiguredPerformanceReviews(employees);
            context.PerformanceReviews.AddRange(reviews);

            // 9. Seed Notifications
            var notifications = GetPreconfiguredNotifications(employees);
            context.Notifications.AddRange(notifications);

            // 10. Seed Attendance Corrections
            var corrections = GetPreconfiguredCorrections(users);
            context.AttendanceCorrections.AddRange(corrections);

            await context.SaveChangesAsync();
        }

        private static List<Department> GetPreconfiguredDepartments()
        {
            return new List<Department>
            {
                new Department { Name = "Ban Giám đốc", Description = "Lãnh đạo và quản lý chiến lược" },
                new Department { Name = "Phòng Nhân sự", Description = "Quản lý nguồn nhân lực, tuyển dụng và văn hóa công ty" },
                new Department { Name = "Phòng Công nghệ", Description = "Phát triển phần mềm, ứng dụng và hạ tầng CNTT" },
                new Department { Name = "Phòng Kinh doanh", Description = "Kinh doanh, phát triển thị trường và chăm sóc khách hàng" },
                new Department { Name = "Phòng Marketing", Description = "Truyền thông, thương hiệu và quảng cáo" },
                new Department { Name = "Phòng Tài chính", Description = "Quản lý tài chính, ngân sách và kế toán" },
                new Department { Name = "Phòng Vận hành", Description = "Hậu cần, kho vận và hành chính quản trị" }
            };
        }

        private static List<Employee> GetPreconfiguredEmployees(List<Department> departments)
        {
            return new List<Employee>
            {
                new Employee 
                { 
                    FullName = "Nguyễn Hoàng Nam", Email = "admin@hrm.com", Position = "Giám đốc điều hành", 
                    DepartmentId = departments[0].Id, BaseSalary = 60000000, Allowance = 15000000,
                    HourlyRate = 340909, HourlyRateOT = 511363, 
                    PhoneNumber = "0901234567", Address = "Hoàn Kiếm, Hà Nội", Gender = "Male",
                    DateOfBirth = new DateTime(1982, 3, 15, 0, 0, 0, DateTimeKind.Utc), IdentityCardNumber = "ID-ADMIN-001"
                },
                new Employee 
                { 
                    FullName = "Phạm Thu Hương", Email = "manager@hrm.com", Position = "Quản lý Dự án IT", 
                    DepartmentId = departments[2].Id, BaseSalary = 40000000, Allowance = 8000000,
                    HourlyRate = 227272, HourlyRateOT = 340909,
                    PhoneNumber = "0901112222", Address = "Quận 1, TP.HCM", Gender = "Female",
                    DateOfBirth = new DateTime(1988, 5, 12, 0, 0, 0, DateTimeKind.Utc)
                },
                new Employee 
                { 
                    FullName = "Lê Minh Phương", Email = "personnel@hrm.com", Position = "Trưởng phòng Nhân sự", 
                    DepartmentId = departments[1].Id, BaseSalary = 30000000, Allowance = 5000000,
                    HourlyRate = 170454, HourlyRateOT = 255681,
                    PhoneNumber = "0903334444", Address = "Lê Chân, Hải Phòng", Gender = "Female"
                },
                new Employee 
                { 
                    FullName = "Trần Tuấn Anh", Email = "employee@hrm.com", Position = "Lập trình viên Senior", 
                    DepartmentId = departments[2].Id, BaseSalary = 25000000, Allowance = 2000000,
                    HourlyRate = 142045, HourlyRateOT = 213068,
                    PhoneNumber = "0907778888", Address = "Ninh Kiều, Cần Thơ", Gender = "Male"
                },
                new Employee { FullName = "Vũ Bảo Ngọc", Email = "marketing@hrm.com", Position = "Chuyên viên Marketing", DepartmentId = departments[4].Id, BaseSalary = 18000000, Allowance = 1500000, HourlyRate = 102272, HourlyRateOT = 153409, Gender = "Female" },
                new Employee { FullName = "Đỗ Hoàng Long", Email = "sales@hrm.com", Position = "Trưởng nhóm Kinh doanh", DepartmentId = departments[3].Id, BaseSalary = 22000000, Allowance = 10000000, HourlyRate = 125000, HourlyRateOT = 187500, Gender = "Male" },
                new Employee { FullName = "Bùi Minh Tuấn", Email = "finance@hrm.com", Position = "Kế toán trưởng", DepartmentId = departments[5].Id, BaseSalary = 28000000, Allowance = 4000000, HourlyRate = 159090, HourlyRateOT = 238636, Gender = "Male" },
                new Employee { FullName = "Phan Thùy Linh", Email = "dev1@hrm.com", Position = "Lập trình viên Frontend", DepartmentId = departments[2].Id, BaseSalary = 18000000, Allowance = 1000000, HourlyRate = 102272, HourlyRateOT = 153409, Gender = "Female" },
                new Employee { FullName = "Trịnh Xuân Trường", Email = "dev2@hrm.com", Position = "Lập trình viên Backend", DepartmentId = departments[2].Id, BaseSalary = 18000000, Allowance = 1000000, HourlyRate = 102272, HourlyRateOT = 153409, Gender = "Male" },
                new Employee { FullName = "Lý Minh Triết", Email = "hr1@hrm.com", Position = "Chuyên viên Tuyển dụng", DepartmentId = departments[1].Id, BaseSalary = 16000000, Allowance = 2000000, HourlyRate = 90909, HourlyRateOT = 136363, Gender = "Male" }
            };
        }

        private static List<User> GetPreconfiguredUsers(List<Employee> employees)
        {
            return new List<User>
            {
                new User { Username = "admin", Password = "Admin@123", Email = "admin@hrm.com", Role = "Admin", EmployeeId = employees[0].Id, IsActive = true },
                new User { Username = "manager", Password = "Manager@123", Email = "manager@hrm.com", Role = "Manager", EmployeeId = employees[1].Id, IsActive = true },
                new User { Username = "personnel", Password = "Personnel@123", Email = "personnel@hrm.com", Role = "Personnel", EmployeeId = employees[2].Id, IsActive = true },
                new User { Username = "employee", Password = "Employee@123", Email = "employee@hrm.com", Role = "Employee", EmployeeId = employees[3].Id, IsActive = true },
                new User { Username = "dev1", Password = "Employee@123", Email = "dev1@hrm.com", Role = "Employee", EmployeeId = employees[7].Id, IsActive = true },
                new User { Username = "sales", Password = "Employee@123", Email = "sales@hrm.com", Role = "Employee", EmployeeId = employees[5].Id, IsActive = true }
            };
        }

        private static List<Attendance> GetPreconfiguredAttendances(List<User> users)
        {
            var attendances = new List<Attendance>();
            var random = new Random();
            var now = DateTime.UtcNow;
            
            // Seed 30 days of data for the first 3 users to make charts look good
            foreach (var u in users.Take(3))
            {
                for (int i = 1; i <= 30; i++)
                {
                    var date = now.AddDays(-i).Date;
                    if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) continue;

                    // Standard start: 08:30 (01:30 UTC)
                    // We generate random check-ins around 08:30
                    var checkIn = date.AddHours(1).AddMinutes(random.Next(15, 45)); 
                    var checkOut = date.AddHours(10).AddMinutes(random.Next(30, 60));
                    
                    var standardCheckIn = new TimeSpan(1, 30, 0);
                    var isLate = checkIn.TimeOfDay > standardCheckIn;

                    int workedMinutes = (int)(checkOut - checkIn).TotalMinutes;
                    int otMinutes = workedMinutes > 480 ? workedMinutes - 480 : 0;

                    attendances.Add(new Attendance
                    {
                        UserId = u.Id,
                        CheckInTime = checkIn,
                        CheckOutTime = checkOut,
                        IsLate = isLate,
                        LateReason = isLate ? "Kẹt xe" : null,
                        Note = isLate ? "Đi muộn" : "Đúng giờ",
                        WorkedMinutes = workedMinutes,
                        OtMinutes = otMinutes
                    });
                }
            }

            // Current day status
            var today = now.Date;
            if (today.DayOfWeek != DayOfWeek.Saturday && today.DayOfWeek != DayOfWeek.Sunday)
            {
                foreach (var u in users)
                {
                    if (random.Next(10) > 2) // 80% chance of being checked in
                    {
                        attendances.Add(new Attendance
                        {
                            UserId = u.Id,
                            CheckInTime = today.AddHours(1).AddMinutes(random.Next(20, 40)),
                            IsLate = false,
                            Note = "Đang làm việc",
                            CreatedAt = now
                        });
                    }
                }
            }
            return attendances;
        }

        private static List<LeaveRequest> GetPreconfiguredLeaveRequests(List<User> users)
        {
            return new List<LeaveRequest>
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
        }

        private static List<JobPosting> GetPreconfiguredJobs()
        {
            return new List<JobPosting>
            {
                new JobPosting { Title = ".NET Tech Lead", Department = "Kỹ thuật", Location = "Hà Nội", MinSalary = 3000, MaxSalary = 5000, Status = "Open", CreatedAt = DateTime.UtcNow, ExpiryDate = DateTime.UtcNow.AddDays(30) },
                new JobPosting { Title = "HR Manager", Department = "Nhân sự", Location = "TP.HCM", MinSalary = 2000, MaxSalary = 3000, Status = "Open", CreatedAt = DateTime.UtcNow, ExpiryDate = DateTime.UtcNow.AddDays(30) }
            };
        }

        private static List<Candidate> GetPreconfiguredCandidates(List<JobPosting> jobs)
        {
            return new List<Candidate>
            {
                new Candidate { FullName = "Ứng Viên Tiềm Năng", Email = "candidate@dev.com", Phone = "0123", JobPostingId = jobs[0].Id, Status = "Interviewing", AppliedAt = DateTime.UtcNow },
                new Candidate { FullName = "Nguyễn Văn Job", Email = "job@hr.com", Phone = "0456", JobPostingId = jobs[1].Id, Status = "New", AppliedAt = DateTime.UtcNow }
            };
        }

        private static List<SystemSetting> GetPreconfiguredSettings()
        {
            return new List<SystemSetting>
            {
                new SystemSetting { Key = "SystemName", Value = "HRM Pro", Category = "General", Description = "Tên hệ thống" },
                new SystemSetting { Key = "LogoUrl", Value = "/logo.png", Category = "UI", Description = "Đường dẫn logo" },
                new SystemSetting { Key = "MaxLoginAttempts", Value = "5", Category = "Security", Description = "Số lần đăng nhập sai tối đa" },
                new SystemSetting { Key = "RequireStrongPassword", Value = "true", Category = "Security", Description = "Yêu cầu mật khẩu mạnh" },
                new SystemSetting { Key = "StandardCheckInTime", Value = "01:30", Category = "General", Description = "Giờ vào làm tiêu chuẩn" },
                new SystemSetting { Key = "StandardCheckOutTime", Value = "10:30", Category = "General", Description = "Giờ tan làm tiêu chuẩn" }
            };
        }

        private static List<PerformanceReview> GetPreconfiguredPerformanceReviews(List<Employee> employees)
        {
            return new List<PerformanceReview>
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
        }

        private static List<AttendanceCorrection> GetPreconfiguredCorrections(List<User> users)
        {
            return new List<AttendanceCorrection>
            {
                new AttendanceCorrection { 
                    UserId = users[4].Id, 
                    RequestedCheckIn = DateTime.UtcNow.Date.AddHours(1).AddMinutes(30), 
                    Reason = "Quên checkin do vội họp", 
                    Status = "Pending", 
                    CreatedAt = DateTime.UtcNow 
                },
                new AttendanceCorrection { 
                    UserId = users[1].Id, 
                    RequestedCheckOut = DateTime.UtcNow.Date.AddHours(10).AddMinutes(45), 
                    Reason = "Quên checkout khi về muộn", 
                    Status = "Approved", 
                    ApproverId = users[0].Id,
                    ApproverComment = "Đã xác nhận làm thêm giờ",
                    CreatedAt = DateTime.UtcNow.AddDays(-1) 
                }
            };
        }

        private static List<Notification> GetPreconfiguredNotifications(List<Employee> employees)
        {
            return new List<Notification>
            {
                new Notification { UserId = employees[0].Id, Title = "Đơn nghỉ phép mới", Message = "Nguyễn Văn Employee vừa nộp đơn xin nghỉ phép.", Type = "Info", CreatedAt = DateTime.UtcNow.AddHours(-2) },
                new Notification { UserId = employees[0].Id, Title = "Lương đã duyệt", Message = "Bảng lương tháng này đã được duyệt.", Type = "Success", CreatedAt = DateTime.UtcNow.AddDays(-1) },
                new Notification { UserId = employees[1].Id, Title = "Họp phòng ban", Message = "Cuộc họp phòng IT lúc 14:00 hôm nay.", Type = "Warning", CreatedAt = DateTime.UtcNow.AddHours(-1) },
                new Notification { UserId = employees[4].Id, Title = "Đơn xin nghỉ được duyệt", Message = "Đơn xin nghỉ của bạn đã được duyệt.", Type = "Success", CreatedAt = DateTime.UtcNow.AddMinutes(-30) }
            };
        }

        }
    }