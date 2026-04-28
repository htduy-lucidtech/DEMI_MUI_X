using System;
using System.ComponentModel.DataAnnotations;

namespace Hrm.Domain.Entities
{
    public class SystemSetting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Key { get; set; } = string.Empty;

        public string? Value { get; set; }

        public string? Description { get; set; }

        public string Category { get; set; } = "General"; // General, Security, UI
    }
}
