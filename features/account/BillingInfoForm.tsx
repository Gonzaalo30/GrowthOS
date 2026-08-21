"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateBillingInfoAction, type BillingFormState } from "@/app/actions/billing";
import type { BillingInfo } from "@/services/billing.service";

const initialState: BillingFormState = {};

export function BillingInfoForm({ billingInfo }: { billingInfo: BillingInfo }) {
  const [state, formAction, isPending] = useActionState(updateBillingInfoAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Nombre o razón social para la factura
        <Input
          name="name"
          defaultValue={billingInfo.name ?? ""}
          placeholder="Tu nombre o el de tu negocio"
          required
          autoComplete="name"
          className="mt-1"
        />
      </label>

      <label className="text-sm font-medium text-foreground">
        NIF / CIF <span className="font-normal text-zinc-400">(opcional)</span>
        <Input
          name="taxId"
          defaultValue={billingInfo.taxId ?? ""}
          placeholder="B12345678"
          className="mt-1"
        />
      </label>

      <label className="text-sm font-medium text-foreground">
        Dirección
        <Input
          name="addressLine1"
          defaultValue={billingInfo.addressLine1 ?? ""}
          placeholder="Calle y número"
          required
          autoComplete="address-line1"
          className="mt-1"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-foreground">
          Ciudad
          <Input
            name="city"
            defaultValue={billingInfo.city ?? ""}
            required
            autoComplete="address-level2"
            className="mt-1"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Código postal
          <Input
            name="postalCode"
            defaultValue={billingInfo.postalCode ?? ""}
            required
            autoComplete="postal-code"
            className="mt-1"
          />
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Guardado. Tus próximas facturas usarán estos datos.</p>}
      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending ? "Guardando…" : "Guardar datos de facturación"}
      </Button>
    </form>
  );
}
