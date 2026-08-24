"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  selectSearchConsoleSiteAction,
  type GoogleIntegrationActionState,
} from "@/app/actions/googleIntegration";
import type { GoogleSiteOption } from "@/lib/googleApis";

const initialState: GoogleIntegrationActionState = {};

export function SelectSearchConsoleSiteForm({ sites }: { sites: GoogleSiteOption[] }) {
  const [state, formAction, isPending] = useActionState(selectSearchConsoleSiteAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending || sites.length === 0} className="self-start">
        {isPending ? "Conectando…" : "Conectar Search Console"}
      </Button>
    </form>
  );
}
