import type Stripe from "stripe";

export interface InvoiceSummary {
  id: string;
  number: string | null;
  createdAt: string;
  amountPaidCents: number;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

/** Historial real de facturas de Stripe — no generamos ni guardamos PDFs propios. */
export async function listInvoices(stripe: Stripe, customerId: string): Promise<InvoiceSummary[]> {
  const invoices = await stripe.invoices.list({ customer: customerId, limit: 12 });
  return invoices.data.map((inv) => ({
    id: inv.id ?? "",
    number: inv.number,
    createdAt: new Date(inv.created * 1000).toISOString(),
    amountPaidCents: inv.amount_paid,
    status: inv.status ?? "desconocido",
    pdfUrl: inv.invoice_pdf ?? null,
    hostedUrl: inv.hosted_invoice_url ?? null,
  }));
}

export interface BillingInfo {
  name: string | null;
  taxId: string | null;
  addressLine1: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

export async function getBillingInfo(stripe: Stripe, customerId: string): Promise<BillingInfo> {
  const customer = await stripe.customers.retrieve(customerId);
  if ("deleted" in customer && customer.deleted) {
    return { name: null, taxId: null, addressLine1: null, city: null, postalCode: null, country: null };
  }

  const taxIds = await stripe.customers.listTaxIds(customerId, { limit: 10 });
  const esTaxId = taxIds.data.find((t) => t.type === "es_cif");

  return {
    name: customer.name ?? null,
    taxId: esTaxId?.value ?? null,
    addressLine1: customer.address?.line1 ?? null,
    city: customer.address?.city ?? null,
    postalCode: customer.address?.postal_code ?? null,
    country: customer.address?.country ?? null,
  };
}

/**
 * Guarda nombre/NIF/dirección en el cliente de Stripe para que las próximas
 * facturas salgan a nombre correcto. El NIF se gestiona como Tax ID de Stripe
 * (no un campo suelto) para que aparezca de verdad en el PDF de la factura.
 */
export async function updateBillingInfo(
  stripe: Stripe,
  customerId: string,
  data: { name: string; taxId: string; addressLine1: string; city: string; postalCode: string; country: string },
) {
  await stripe.customers.update(customerId, {
    name: data.name,
    address: {
      line1: data.addressLine1,
      city: data.city,
      postal_code: data.postalCode,
      country: data.country,
    },
  });

  // El Tax ID de Stripe es específico por país (es_cif, mx_rfc, ar_cuit...);
  // hoy solo sabemos crear correctamente el de España. Para otros países el
  // NIF/CIF se guarda solo como texto en el nombre/dirección, no como Tax ID
  // formal, para no mandar a Stripe un tipo que no le corresponde.
  if (data.taxId && data.country === "ES") {
    const existing = await stripe.customers.listTaxIds(customerId, { limit: 10 });
    await Promise.all(
      existing.data
        .filter((t) => t.type === "es_cif")
        .map((t) => stripe.customers.deleteTaxId(customerId, t.id)),
    );
    await stripe.customers.createTaxId(customerId, { type: "es_cif", value: data.taxId });
  }
}
