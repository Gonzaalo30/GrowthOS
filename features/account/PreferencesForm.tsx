"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { updateDateFormatAction, type AccountState } from "@/app/actions/account";
import { DATE_FORMAT_LABELS } from "@/lib/formatDate";
import type { DateFormat } from "@/types/database.types";

const initialState: AccountState = {};

export function PreferencesForm({ dateFormat }: { dateFormat: DateFormat }) {
  const [state, formAction, isPending] = useActionState(updateDateFormatAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Formato de fecha
        <select
          name="dateFormat"
          defaultValue={dateFormat}
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        >
          {(Object.keys(DATE_FORMAT_LABELS) as DateFormat[]).map((key) => (
            <option key={key} value={key}>
              {DATE_FORMAT_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-foreground">
        Idioma
        <select
          disabled
          defaultValue="es"
          className="mt-1 w-full cursor-not-allowed rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-zinc-500 outline-none"
        >
          <option value="es">Español (más idiomas próximamente)</option>
        </select>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={isPending} variant="secondary" className="mt-1 self-start">
        {isPending ? "Guardando…" : "Guardar preferencias"}
      </Button>
    </form>
  );
}
