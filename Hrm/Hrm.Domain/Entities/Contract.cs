using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hrm.Domain.Entities
{
    public class Contract
    {
        public int Id { get; set; }
        
        [Required]
        public string ContractNumber { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty; // Probation, Indefinite, Fixed-term
        
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        public decimal Salary { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired, Terminated
        
        public string? Notes { get; set; }
        
        public int EmployeeId { get; set; }
        
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
