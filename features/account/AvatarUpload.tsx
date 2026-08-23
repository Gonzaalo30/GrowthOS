"use client";

import { useActionState, useRef, useState } from "react";
import { updateAvatarAction, type AccountState } from "@/app/actions/account";
import { cn } from "@/lib/utils";

const initialState: AccountState = {};

export function AvatarUpload({
  name,
  avatarUrl,
  ringClass,
}: {
  name: string;
  avatarUrl: string | null;
  /** Color del anillo según el nivel real (ver lib/levels.ts:getLevelRingClass). */
  ringClass?: string;
}) {
  const [state, formAction, isPending] = useActionState(updateAvatarAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const displayUrl = preview ?? avatarUrl;
  const ring = ringClass && cn("ring-4 ring-offset-2 ring-offset-surface", ringClass);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-4">
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage, no de assets propios
        <img src={displayUrl} alt="" className={cn("h-16 w-16 rounded-full object-cover", ring)} />
      ) : (
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700",
            ring,
          )}
        >
          {initial}
        </div>
      )}
      <div>
        <label className="cursor-pointer text-sm font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
          {isPending ? "Subiendo…" : "Cambiar foto"}
          <input
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={isPending}
            className="hidden"
          />
        </label>
        <p className="mt-1 text-xs text-zinc-500">PNG, JPG o WEBP. Máximo 2 MB.</p>
        {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
