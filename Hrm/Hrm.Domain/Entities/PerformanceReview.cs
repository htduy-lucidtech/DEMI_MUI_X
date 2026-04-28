using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hrm.Domain.Entities
{
    public class PerformanceReview
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        public int ReviewerId { get; set; }
        [ForeignKey("ReviewerId")]
        public Employee? Reviewer { get; set; }

        public DateTime ReviewDate { get; set; }

        // Evaluation scores (e.g., 1-5 scale)
        public int WorkQuality { get; set; }
        public int Teamwork { get; set; }
        public int Punctuality { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal TotalScore { get; set; } // Average or calculated score

        public string? Comments { get; set; }
        public string? GoalsForNextPeriod { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
    }
}
