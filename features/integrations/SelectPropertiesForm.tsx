"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  selectGooglePropertiesAction,
  type GoogleIntegrationActionState,
} from "@/app/actions/googleIntegration";
import type { GoogleSiteOption, GoogleAnalyticsPropertyOption } from "@/lib/googleApis";

const initialState: GoogleIntegrationActionState = {};

export function SelectPropertiesForm({
  sites,
  properties,
}: {
  sites: GoogleSiteOption[];
  properties: GoogleAnalyticsPropertyOption[];
}) {
  const [state, formAction, isPending] = useActionState(selectGooglePropertiesAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-foreground">
        Sitio de Search Console
        <select
          name="siteUrl"
          required
          disabled={sites.length === 0}
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">Elige un sitio…</option>
          {sites.map((s) => (
            <option key={s.siteUrl} value={s.siteUrl}>
              {s.siteUrl}
            </option>
          ))}
        </select>
        {sites.length === 0 && (
          <span className="mt-1 block text-xs text-zinc-500">
            No hemos encontrado ningún sitio verificado en tu cuenta de Search Console.
          </span>
        )}
      </label>

      <label className="text-sm font-medium text-foreground">
        Propiedad de Google Analytics
        <select
          name="propertyId"
          required
          disabled={properties.length === 0}
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

      <Button type="submit" disabled={isPending || sites.length === 0 || properties.length === 0} className="self-start">
        {isPending ? "Conectando…" : "Empezar a sincronizar"}
      </Button>
    </form>
  );
}
