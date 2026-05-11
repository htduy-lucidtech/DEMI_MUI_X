namespace Hrm.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int? SecurityScore { get; set; }
        public string Role { get; set; } = "Employee";
        public bool IsActive { get; set; } = true;

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public int? BranchId { get; set; }
        public Branch? Branch { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
