namespace Hrm.Domain.Entities
{
    public class Permission
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty; // e.g. "EMP_VIEW"
        public string Name { get; set; } = string.Empty; // e.g. "Xem hồ sơ nhân sự"
        public string? Description { get; set; }
        public string Module { get; set; } = string.Empty; // e.g. "Personnel"
    }
}
