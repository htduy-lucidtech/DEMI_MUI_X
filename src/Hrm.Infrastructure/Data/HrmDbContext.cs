using Microsoft.EntityFrameworkCore;
using Hrm.Domain.Entities;

namespace Hrm.Infrastructure.Data {
    public class HrmDbContext : DbContext {
        public HrmDbContext(DbContextOptions<HrmDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }           
        public DbSet<Employee> Employees { get; set; }     
        public DbSet<Attendance> Attendances { get; set; } 
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<AttendanceCorrection> AttendanceCorrections { get; set; }
        public DbSet<AttendanceConfig> AttendanceConfigs { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<Department> Departments { get; set; } 
        public DbSet<JobPosting> JobPostings { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<PerformanceReview> PerformanceReviews { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Contract> Contracts { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Account)
                .WithOne(u => u.Employee)
                .HasForeignKey<User>(u => u.EmployeeId);

            base.OnModelCreating(modelBuilder);
        }
    }
}