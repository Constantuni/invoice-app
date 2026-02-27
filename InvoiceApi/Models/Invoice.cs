using System;
using System.Collections.Generic;

namespace InvoiceApi.Models;

public partial class Invoice
{
    public int InvoiceId { get; set; }

    public int? CustomerId { get; set; }

    public string? InvoiceNumber { get; set; }

    public DateTime? InvoiceDate { get; set; }

    public decimal? TotalAmount { get; set; }

    public int? UserId { get; set; }

    public DateTime? RecordDate { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();

    public virtual User? User { get; set; }
}
