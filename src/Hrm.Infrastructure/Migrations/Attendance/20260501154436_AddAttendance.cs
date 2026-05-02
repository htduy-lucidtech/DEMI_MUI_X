using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hrm.Infrastructure.Migrations.Attendance
{
    /// <inheritdoc />
    public partial class AddAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalComment",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Attendances",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DeviceId",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EarlyMinutes",
                table: "Attendances",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GeoJson",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LateMinutes",
                table: "Attendances",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OtMinutes",
                table: "Attendances",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShiftId",
                table: "Attendances",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Attendances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Attendances",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkedMinutes",
                table: "Attendances",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AttendanceConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DefaultGraceMinutes = table.Column<int>(type: "integer", nullable: false),
                    DefaultRoundMinutes = table.Column<int>(type: "integer", nullable: false),
                    PreWindowMinutes = table.Column<int>(type: "integer", nullable: false),
                    PostWindowMinutes = table.Column<int>(type: "integer", nullable: false),
                    OtThresholdMinutes = table.Column<int>(type: "integer", nullable: false),
                    GeoFenceEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    GeoFenceJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceCorrections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AttendanceId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    RequestedCheckIn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RequestedCheckOut = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ApproverId = table.Column<int>(type: "integer", nullable: true),
                    ApproverComment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceCorrections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceCorrections_Attendances_AttendanceId",
                        column: x => x.AttendanceId,
                        principalTable: "Attendances",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Timezone = table.Column<string>(type: "text", nullable: true),
                    BreaksJson = table.Column<string>(type: "text", nullable: true),
                    GraceMinutes = table.Column<int>(type: "integer", nullable: false),
                    RoundMinutes = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_ShiftId",
                table: "Attendances",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceCorrections_AttendanceId",
                table: "AttendanceCorrections",
                column: "AttendanceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_Shifts_ShiftId",
                table: "Attendances",
                column: "ShiftId",
                principalTable: "Shifts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_Shifts_ShiftId",
                table: "Attendances");

            migrationBuilder.DropTable(
                name: "AttendanceConfigs");

            migrationBuilder.DropTable(
                name: "AttendanceCorrections");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_ShiftId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "ApprovalComment",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "DeviceId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "EarlyMinutes",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "GeoJson",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "LateMinutes",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "OtMinutes",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "ShiftId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "WorkedMinutes",
                table: "Attendances");
        }
    }
}
