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
public class CustomerController : ControllerBase
{
    private readonly InvoiceDbContext _context;

    public CustomerController(InvoiceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _context.Customers.OrderBy(c => c.Title).ToListAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Customer input)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        input.UserId = userId;
        input.RecordDate = DateTime.Now;
        _context.Customers.Add(input);
        await _context.SaveChangesAsync();
        return Ok(input);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] Customer input)
    {
        var existing = await _context.Customers.FindAsync(input.CustomerId);
        if (existing == null) return NotFound(new { message = "Müşteri bulunamadı." });

        existing.TaxNumber = input.TaxNumber;
        existing.Title = input.Title;
        existing.Address = input.Address;
        existing.Email = input.Email;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool force = false)
    {
        var existing = await _context.Customers
            .Include(c => c.Invoices)
                .ThenInclude(i => i.InvoiceLines)
            .FirstOrDefaultAsync(c => c.CustomerId == id);

        if (existing == null)
            return NotFound(new { message = "Müşteri bulunamadı." });

        if (existing.Invoices.Any() && !force)
            return Conflict(new {
                message = $"Bu müşteriye ait {existing.Invoices.Count} adet fatura bulunmaktadır. Müşteriyi silmek tüm faturaları da silecektir.",
                hasInvoices = true,
                invoiceCount = existing.Invoices.Count
            });

        if (existing.Invoices.Any())
        {
            foreach (var invoice in existing.Invoices)
                _context.InvoiceLines.RemoveRange(invoice.InvoiceLines);
            _context.Invoices.RemoveRange(existing.Invoices);
        }

        _context.Customers.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Müşteri silindi." });
    }
}