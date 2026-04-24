namespace Hrm.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // In a real app, use password hashing
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee"; // Admin, Attendance, Personnel, Manager, Employee
        public bool IsActive { get; set; } = true;
    }
}
