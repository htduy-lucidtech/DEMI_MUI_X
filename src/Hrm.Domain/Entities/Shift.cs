namespace Hrm.Domain.Entities
{
    public class Shift
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        // store times as TimeSpan (local time of shift) or full datetime with timezone
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Timezone { get; set; }
        public string? BreaksJson { get; set; }
        public int GraceMinutes { get; set; }
        public int RoundMinutes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
