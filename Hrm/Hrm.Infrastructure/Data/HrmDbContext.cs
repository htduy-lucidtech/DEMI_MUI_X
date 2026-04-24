using Microsoft.EntityFrameworkCore;
using Hrm.Domain.Entities;

namespace Hrm.Infrastructure.Data {
    public class HrmDbContext : DbContext {
        public HrmDbContext(DbContextOptions<HrmDbContext> options) : base(options) { }

        // Các bảng tương ứng với 5 Tab
        public DbSet<User> Users { get; set; }           // Admin tạo tài khoản tại đây
        public DbSet<Attendance> Attendances { get; set; } // Nhân viên Check-in tại đây
        public DbSet<Department> Departments { get; set; } // Quản lý phòng ban
    }
}