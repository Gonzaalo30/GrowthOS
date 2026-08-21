"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateBusinessAction, type AccountState } from "@/app/actions/account";
import { BUSINESS_TYPES, COMPANY_SIZES } from "@/lib/businessTypes";

const initialState: AccountState = {};

export function BusinessForm({
  domain,
  businessType,
  city,
  companySize,
}: {
  domain: string;
  businessType: string;
  city: string | null;
  companySize: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateBusinessAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Web de tu negocio
        <Input name="domain" defaultValue={domain} required autoComplete="url" className="mt-1" />
      </label>

      <label className="text-sm font-medium text-foreground">
        Tipo de negocio
        <select
          name="businessType"
          required
          defaultValue={businessType}
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-foreground">
        Ciudad
        <Input
          name="city"
          defaultValue={city ?? ""}
          required
          autoComplete="address-level2"
          className="mt-1"
        />
      </label>

      <label className="text-sm font-medium text-foreground">
        Tamaño de la empresa
        <select
          name="companySize"
          required
          defaultValue={companySize ?? ""}
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        >
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending ? "Guardando…" : "Guardar negocio"}
      </Button>
    </form>
  );
}
