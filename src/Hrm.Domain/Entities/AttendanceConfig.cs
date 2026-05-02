namespace Hrm.Domain.Entities
{
    public class AttendanceConfig
    {
        public int Id { get; set; }
        public int DefaultGraceMinutes { get; set; } = 5;
        public int DefaultRoundMinutes { get; set; } = 5;
        public int PreWindowMinutes { get; set; } = 30;
        public int PostWindowMinutes { get; set; } = 30;
        public int OtThresholdMinutes { get; set; } = 15;
        public bool GeoFenceEnabled { get; set; } = false;
        public string? GeoFenceJson { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
