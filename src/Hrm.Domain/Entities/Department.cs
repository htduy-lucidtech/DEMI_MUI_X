namespace Hrm.Domain.Entities
{
    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int? ParentId { get; set; }
        public virtual Department? Parent { get; set; }
        public virtual ICollection<Department> SubDepartments { get; set; } = new List<Department>();
    }
}
