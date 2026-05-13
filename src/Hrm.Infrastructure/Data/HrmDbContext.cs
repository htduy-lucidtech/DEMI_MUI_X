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
        
        // RBAC
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<ApprovalRequest> ApprovalRequests { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Account)
                .WithOne(u => u.Employee)
                .HasForeignKey<User>(u => u.EmployeeId);

            modelBuilder.Entity<Department>()
                .HasOne(d => d.Parent)
                .WithMany(d => d.SubDepartments)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexing for Performance Optimization
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.DepartmentId);

            modelBuilder.Entity<Attendance>()
                .HasIndex(a => new { a.UserId, a.CheckInTime });

            modelBuilder.Entity<LeaveRequest>()
                .HasIndex(l => new { l.UserId, l.StartDate });

            modelBuilder.Entity<ApprovalRequest>()
                .HasIndex(ar => ar.Status);

            modelBuilder.Entity<AuditLog>()
                .HasIndex(al => al.Timestamp);

            base.OnModelCreating(modelBuilder);
        }
    }
}