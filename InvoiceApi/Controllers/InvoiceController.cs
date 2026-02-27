using InvoiceApi.Data;
using InvoiceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InvoiceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly InvoiceDbContext _context;

    public InvoiceController(InvoiceDbContext context)
    {
        _context = context;
    }

    // GET: api/invoice?startDate=2024-01-01&endDate=2024-12-31
    [HttpGet]
    public async Task<IActionResult> InvoiceList([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var invoices = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.InvoiceLines)
            .Where(i => i.InvoiceDate >= startDate && i.InvoiceDate <= endDate)
            .ToListAsync();

        return Ok(invoices);
    }

    // POST: api/invoice
    [HttpPost]
    public async Task<IActionResult> InvoiceSave([FromBody] Invoice input)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (input.CustomerId == null || input.CustomerId == 0) input.CustomerId = null;
        input.UserId = userId;
        input.RecordDate = DateTime.Now;

        foreach (var line in input.InvoiceLines)
        {
            line.UserId = userId;
            line.RecordDate = DateTime.Now;
        }

        input.TotalAmount = input.InvoiceLines.Sum(l => (l.Price ?? 0) * (l.Quentity ?? 0));

        _context.Invoices.Add(input);
        await _context.SaveChangesAsync();

        return Ok(input);
    }

    // PUT: api/invoice
    [HttpPut]
    public async Task<IActionResult> InvoiceUpdate([FromBody] Invoice input)
    {
        var existing = await _context.Invoices
            .Include(i => i.InvoiceLines)
            .FirstOrDefaultAsync(i => i.InvoiceId == input.InvoiceId);

        if (existing == null)
            return NotFound(new { message = "Fatura bulunamadı." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        existing.CustomerId = input.CustomerId == 0 ? null : input.CustomerId;
        existing.InvoiceNumber = input.InvoiceNumber;
        existing.InvoiceDate = input.InvoiceDate;

        // Eski satırları sil, yenilerini ekle
        _context.InvoiceLines.RemoveRange(existing.InvoiceLines);

        foreach (var line in input.InvoiceLines)
        {
            line.UserId = userId;
            line.RecordDate = DateTime.Now;
            line.InvoiceId = existing.InvoiceId;
        }

        existing.InvoiceLines = input.InvoiceLines;
        existing.TotalAmount = input.InvoiceLines.Sum(l => (l.Price ?? 0) * (l.Quentity ?? 0));

        await _context.SaveChangesAsync();

        return Ok(existing);
    }

    // DELETE: api/invoice
    [HttpDelete]
    public async Task<IActionResult> InvoiceDelete([FromBody] Invoice input)
    {
        var existing = await _context.Invoices
            .Include(i => i.InvoiceLines)
            .FirstOrDefaultAsync(i => i.InvoiceId == input.InvoiceId);

        if (existing == null)
            return NotFound(new { message = "Fatura bulunamadı." });

        _context.InvoiceLines.RemoveRange(existing.InvoiceLines);
        _context.Invoices.Remove(existing);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Fatura silindi." });
    }
}