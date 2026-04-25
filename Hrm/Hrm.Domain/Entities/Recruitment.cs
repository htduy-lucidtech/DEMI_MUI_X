using System.ComponentModel.DataAnnotations;

namespace Hrm.Domain.Entities
{
    public class JobPosting
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public string Location { get; set; } = "Hà Nội";

        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }

        public string Status { get; set; } = "Open"; // Open, Closed, Draft

        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Candidate>? Candidates { get; set; }
    }

    public class Candidate
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string ResumeUrl { get; set; } = string.Empty;

        public string Status { get; set; } = "Applied"; // Applied, Interviewing, Offered, Rejected, Hired

        public int JobPostingId { get; set; }
        public virtual JobPosting? JobPosting { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    }
}
