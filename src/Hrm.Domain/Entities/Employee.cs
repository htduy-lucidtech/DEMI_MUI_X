using System;

namespace Hrm.Domain.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }

        // Identity
        public string? IdentityCardNumber { get; set; }
        public string? IdentityCardImageUrl { get; set; }
        public string? PortraitImageUrl { get; set; }

        // Bank & Insurance
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public string? SocialInsuranceNumber { get; set; }

        // Work Info
        public string? Position { get; set; }
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public int? ManagerId { get; set; }
        public Employee? Manager { get; set; }

        // Salary
        public decimal BaseSalary { get; set; }
        public decimal Allowance { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal HourlyRateOT { get; set; }

        // Account (Account is child of Personnel)
        public User? Account { get; set; }
    }
}
