"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  saveGoogleBusinessChecklistAction,
  type GoogleBusinessChecklistState,
} from "@/app/actions/googleBusinessChecklist";
import { GOOGLE_BUSINESS_CHECKLIST } from "@/lib/googleBusinessChecklist";
import type { Database } from "@/types/database.types";

type Checklist = Database["public"]["Tables"]["google_business_checklists"]["Row"];

const initialState: GoogleBusinessChecklistState = {};

export function GoogleBusinessChecklistForm({ checklist }: { checklist: Checklist | null }) {
  const [state, formAction, isPending] = useActionState(saveGoogleBusinessChecklistAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        URL de tu ficha de Google Business
        <Input
          name="profileUrl"
          type="url"
          required
          placeholder="https://maps.app.goo.gl/..."
          defaultValue={checklist?.profile_url ?? ""}
          className="mt-1"
        />
      </label>

      <div className="flex flex-col gap-2">
        {GOOGLE_BUSINESS_CHECKLIST.map((item) => (
          <label key={item.field} className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name={item.formField}
              defaultChecked={checklist?.[item.field] ?? false}
              className="mt-0.5 h-4 w-4 rounded border-border text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            {item.question}
          </label>
        ))}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando…" : checklist ? "Actualizar checklist" : "Guardar checklist"}
      </Button>
    </form>
  );
}
