using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Temporarily disabled for easier testing, enable in prod
    public class PerformanceReviewsController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public PerformanceReviewsController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPerformanceReviews()
        {
            var reviews = await _context.PerformanceReviews
                .Include(p => p.Employee)
                .Include(p => p.Reviewer)
                .Select(p => new
                {
                    p.Id,
                    p.EmployeeId,
                    EmployeeName = p.Employee != null ? p.Employee.FullName : "Unknown",
                    p.ReviewerId,
                    ReviewerName = p.Reviewer != null ? p.Reviewer.FullName : "Unknown",
                    p.ReviewDate,
                    p.WorkQuality,
                    p.Teamwork,
                    p.Punctuality,
                    p.TotalScore,
                    p.Comments,
                    p.GoalsForNextPeriod,
                    p.Status
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<ActionResult<PerformanceReview>> CreatePerformanceReview(PerformanceReview review)
        {
            // Calculate total score average
            review.TotalScore = Math.Round((decimal)(review.WorkQuality + review.Teamwork + review.Punctuality) / 3, 2);
            review.ReviewDate = DateTime.UtcNow;

            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPerformanceReviews), new { id = review.Id }, review);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerformanceReview(int id, PerformanceReview review)
        {
            if (id != review.Id) return BadRequest();

            // Recalculate total score
            review.TotalScore = Math.Round((decimal)(review.WorkQuality + review.Teamwork + review.Punctuality) / 3, 2);

            _context.Entry(review).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PerformanceReviewExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerformanceReview(int id)
        {
            var review = await _context.PerformanceReviews.FindAsync(id);
            if (review == null) return NotFound();

            _context.PerformanceReviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PerformanceReviewExists(int id)
        {
            return _context.PerformanceReviews.Any(e => e.Id == id);
        }
    }
}
