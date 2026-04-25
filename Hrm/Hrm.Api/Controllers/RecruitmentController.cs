using Hrm.Domain.Entities;
using Hrm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hrm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentController : ControllerBase
    {
        private readonly HrmDbContext _context;

        public RecruitmentController(HrmDbContext context)
        {
            _context = context;
        }

        [HttpGet("jobs")]
        public async Task<ActionResult<IEnumerable<JobPosting>>> GetJobs()
        {
            return await _context.JobPostings
                .Include(j => j.Candidates)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        [HttpPost("jobs")]
        public async Task<ActionResult<JobPosting>> CreateJob(JobPosting job)
        {
            _context.JobPostings.Add(job);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJobs), new { id = job.Id }, job);
        }

        [HttpGet("candidates")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates
                .Include(c => c.JobPosting)
                .OrderByDescending(c => c.AppliedAt)
                .ToListAsync();
        }

        [HttpPatch("candidates/{id}/status")]
        public async Task<IActionResult> UpdateCandidateStatus(int id, [FromBody] string status)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null) return NotFound();

            candidate.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
