using System;
using System.Collections.Generic;

namespace InvoiceApi.Models;

public partial class Customer
{
    public int CustomerId { get; set; }

    public string? TaxNumber { get; set; }

    public string? Title { get; set; }

    public string? Address { get; set; }

    public string? Email { get; set; }

    public int? UserId { get; set; }

    public DateTime? RecordDate { get; set; }

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual User? User { get; set; }
}
