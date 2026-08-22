"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendContactMessageAction, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = {};

export function ContactForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [state, formAction, isPending] = useActionState(sendContactMessageAction, initialState);

  if (state.success) {
    return (
      <p className="text-center text-sm text-emerald-700">
        Recibido. Te contestamos en menos de 24-48h laborables.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Tu nombre
        <Input name="name" defaultValue={defaultName} required autoComplete="name" className="mt-1" />
      </label>
      <label className="text-sm font-medium text-foreground">
        Tu email
        <Input
          name="email"
          type="email"
          defaultValue={defaultEmail}
          required
          autoComplete="email"
          className="mt-1"
        />
      </label>
      <label className="text-sm font-medium text-foreground">
        ¿En qué podemos ayudarte?
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Cuéntanos tu duda o lo que necesites..."
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
