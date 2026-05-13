using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Hrm.Service.Implementations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Hrm.Tests
{
    public class AuthServiceTests : IDisposable
    {
        private readonly HrmDbContext _context;
        private readonly Mock<IConfiguration> _configMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<HrmDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new HrmDbContext(options);

            _configMock = new Mock<IConfiguration>();
            
            // Mock JWT settings
            var jwtSection = new Mock<IConfigurationSection>();
            jwtSection.Setup(s => s["Key"]).Returns("very_long_secret_key_for_testing_12345");
            jwtSection.Setup(s => s["Issuer"]).Returns("HRM_API");
            jwtSection.Setup(s => s["Audience"]).Returns("HRM_WEB");
            _configMock.Setup(c => c.GetSection("Jwt")).Returns(jwtSection.Object);

            _authService = new AuthService(_context, _configMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        private async Task<Employee> CreateTestEmployee()
        {
            var employee = new Employee 
            { 
                FullName = "Test Employee", 
                Email = "employee@test.com",
                BaseSalary = 1000,
                HourlyRate = 10
            };
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsToken()
        {
            // Arrange
            var emp = await CreateTestEmployee();
            var user = new User 
            { 
                Username = "testuser", 
                Password = "password123", 
                Email = "test@test.com", 
                Role = "Admin",
                IsActive = true,
                EmployeeId = emp.Id
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var token = await _authService.Login("testuser", "password123");

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsNull()
        {
            // Arrange
            var emp = await CreateTestEmployee();
            var user = new User 
            { 
                Username = "testuser", 
                Password = "password123", 
                Email = "test@test.com", 
                Role = "Admin",
                IsActive = true,
                EmployeeId = emp.Id
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var token = await _authService.Login("testuser", "wrongpassword");

            // Assert
            Assert.Null(token);
        }

        [Fact]
        public async Task GetUserByUsername_ExistingUser_ReturnsUser()
        {
            // Arrange
            var emp = await CreateTestEmployee();
            var user = new User 
            { 
                Username = "testuser", 
                Password = "password123", 
                Email = "test@test.com", 
                Role = "Admin",
                IsActive = true,
                EmployeeId = emp.Id
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _authService.GetUserByUsername("testuser");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("testuser", result.Username);
        }
    }
}
