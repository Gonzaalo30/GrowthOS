import type { InvoiceSummary } from "@/services/billing.service";

const STATUS_LABELS: Record<string, string> = {
  paid: "Pagada",
  open: "Pendiente de pago",
  void: "Anulada",
  uncollectible: "Impagada",
  draft: "Borrador",
};

const STATUS_CLASSES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  open: "bg-amber-50 text-amber-700",
  void: "bg-zinc-100 text-zinc-500",
  uncollectible: "bg-red-50 text-red-700",
  draft: "bg-zinc-100 text-zinc-500",
};

function formatPrice(cents: number) {
  return `${(cents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function InvoiceHistory({ invoices }: { invoices: InvoiceSummary[] }) {
  if (invoices.length === 0) {
    return <p className="text-sm text-zinc-500">Todavía no tienes facturas.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatDate(invoice.createdAt)} — {formatPrice(invoice.amountPaidCents)}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                STATUS_CLASSES[invoice.status] ?? "bg-zinc-100 text-zinc-500"
              }`}
            >
              {STATUS_LABELS[invoice.status] ?? invoice.status}
            </span>
          </div>
          {invoice.pdfUrl && (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-sm font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              Descargar PDF
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
