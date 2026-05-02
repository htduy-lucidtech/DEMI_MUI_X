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

        [HttpPut("jobs/{id}")]
        public async Task<IActionResult> UpdateJob(int id, JobPosting job)
        {
            if (id != job.Id) return BadRequest();
            _context.Entry(job).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("jobs/{id}")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var job = await _context.JobPostings.FindAsync(id);
            if (job == null) return NotFound();
            _context.JobPostings.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("candidates")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates
                .Include(c => c.JobPosting)
                .OrderByDescending(c => c.AppliedAt)
                .ToListAsync();
        }

        [HttpPost("candidates")]
        public async Task<ActionResult<Candidate>> CreateCandidate(Candidate candidate)
        {
            candidate.AppliedAt = DateTime.UtcNow;
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCandidates), new { id = candidate.Id }, candidate);
        }

        [HttpPut("candidates/{id}")]
        public async Task<IActionResult> UpdateCandidate(int id, Candidate candidate)
        {
            if (id != candidate.Id) return BadRequest();
            _context.Entry(candidate).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("candidates/{id}")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null) return NotFound();
            _context.Candidates.Remove(candidate);
            await _context.SaveChangesAsync();
            return NoContent();
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
