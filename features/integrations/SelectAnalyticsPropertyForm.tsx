"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  selectAnalyticsPropertyAction,
  type GoogleIntegrationActionState,
} from "@/app/actions/googleIntegration";
import type { GoogleAnalyticsPropertyOption } from "@/lib/googleApis";

const initialState: GoogleIntegrationActionState = {};

export function SelectAnalyticsPropertyForm({
  properties,
  currentPropertyId,
}: {
  properties: GoogleAnalyticsPropertyOption[];
  currentPropertyId?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(selectAnalyticsPropertyAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Propiedad de Google Analytics
        <select
          name="propertyId"
          required
          disabled={properties.length === 0}
          defaultValue={currentPropertyId ?? ""}
          onChange={(e) => {
            const name = e.target.selectedOptions[0]?.dataset.name ?? "";
            const hidden = e.currentTarget.form?.elements.namedItem("propertyName") as HTMLInputElement | null;
            if (hidden) hidden.value = name;
          }}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">Elige una propiedad…</option>
          {properties.map((p) => (
            <option key={p.propertyId} value={p.propertyId} data-name={p.propertyName}>
              {p.propertyName}
            </option>
          ))}
        </select>
        {properties.length === 0 && (
          <span className="mt-1 block text-xs text-zinc-500">
            No hemos encontrado ninguna propiedad de Analytics accesible con esta cuenta.
          </span>
        )}
      </label>
      <input type="hidden" name="propertyName" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending || properties.length === 0} className="self-start">
        {isPending ? "Guardando…" : currentPropertyId ? "Guardar cambio" : "Conectar Analytics"}
      </Button>
    </form>
  );
}
