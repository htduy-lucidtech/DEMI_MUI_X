using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(HrmDbContext context)
        {
            // Tạm thời xóa và tạo lại để cập nhật schema (cột IsActive)
            // Sau khi DB đã được cập nhật, bạn có thể comment dòng EnsureDeleted lại.
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // 1. Seed Departments (Phòng ban)
            if (!context.Departments.Any())
            {
                var departments = new List<Department>();
                string[] deptNames = { 
                    "Phòng Nhân sự", "Phòng Kế toán", "Phòng Kỹ thuật", 
                    "Phòng Kinh doanh", "Phòng Marketing", "Phòng R&D", 
                    "Phòng Bảo mật", "Phòng Chăm sóc khách hàng", "Phòng Đào tạo", 
                    "Ban Giám đốc" 
                };

                foreach (var name in deptNames)
                {
                    departments.Add(new Department 
                    { 
                        Name = name, 
                        Description = $"Mô tả cho {name}" 
                    });
                }
                
                context.Departments.AddRange(departments);
                await context.SaveChangesAsync();
            }

            // 2. Seed Users (Người dùng)
            if (!context.Users.Any())
            {
                var users = new List<User>();

                // Thêm các tài khoản cố định cho từng vai trò
                var defaultUsers = new List<User>
                {
                    new User { Username = "admin", Password = "Admin@123", FullName = "Quản trị viên Hệ thống", Role = "Admin", Email = "admin@example.com", IsActive = true },
                    new User { Username = "manager", Password = "Manager@123", FullName = "Quản lý Dự án", Role = "Manager", Email = "manager@example.com", IsActive = true },
                    new User { Username = "personnel", Password = "Personnel@123", FullName = "Trưởng phòng Nhân sự", Role = "Personnel", Email = "personnel@example.com", IsActive = true },
                    new User { Username = "attendance", Password = "Attendance@123", FullName = "Nhân viên Chấm công", Role = "Attendance", Email = "attendance@example.com", IsActive = true },
                    new User { Username = "employee", Password = "Employee@123", FullName = "Nhân viên Thử việc", Role = "Employee", Email = "employee@example.com", IsActive = true }
                };

                users.AddRange(defaultUsers);

                // Thêm thêm người dùng ngẫu nhiên để đủ 10 mẫu
                var roles = new[] { "Admin", "Attendance", "Personnel", "Manager", "Employee" };
                var lastNames = new[] { "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng" };
                var firstNames = new[] { "Thanh", "Minh", "Hải", "Tuấn", "Anh" };

                for (int i = 5; i < 10; i++)
                {
                    var role = roles[i % roles.Length];
                    users.Add(new User 
                    { 
                        Username = $"user{i + 1}", 
                        Password = "Password@123", 
                        FullName = $"{lastNames[i % lastNames.Length]} {firstNames[i % firstNames.Length]} {i + 1}", 
                        Role = role, 
                        Email = $"user{i + 1}@hrm-demo.com",
                        IsActive = true
                    });
                }

                context.Users.AddRange(users);
                await context.SaveChangesAsync();
            }

            // 3. Seed Attendances (Chấm công)
            if (!context.Attendances.Any())
            {
                var allUsers = await context.Users.ToListAsync();
                var attendances = new List<Attendance>();
                var random = new Random();
                
                for (int i = 0; i < 15; i++)
                {
                    var user = allUsers[random.Next(allUsers.Count)];
                    // PostgreSQL yêu cầu DateTimeKind.Utc cho timestamp with time zone
                    var date = DateTime.UtcNow.AddDays(-random.Next(1, 10));
                    var checkIn = new DateTime(date.Year, date.Month, date.Day, random.Next(7, 9), random.Next(0, 60), 0, DateTimeKind.Utc);
                    var checkOut = checkIn.AddHours(8).AddMinutes(random.Next(0, 60));
                    
                    attendances.Add(new Attendance
                    {
                        UserId = user.Id,
                        CheckInTime = checkIn,
                        CheckOutTime = checkOut,
                        Note = i % 3 == 0 ? "Đi làm đúng giờ" : "Làm thêm giờ"
                    });
                }
                
                context.Attendances.AddRange(attendances);
                await context.SaveChangesAsync();
            }
        }
    }
}
