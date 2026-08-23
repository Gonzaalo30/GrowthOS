"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  enrollMfaAction,
  verifyMfaEnrollmentAction,
  disableMfaAction,
  type MfaFactor,
  type MfaVerifyState,
} from "@/app/actions/mfa";

const initialVerifyState: MfaVerifyState = {};

export function TwoFactorForm({ factors }: { factors: MfaFactor[] }) {
  const [verifiedFactorId, setVerifiedFactorId] = useState(
    factors.find((f) => f.status === "verified")?.id ?? null,
  );
  const [enrollment, setEnrollment] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [verifyState, verifyAction, isVerifying] = useActionState(
    async (_prev: MfaVerifyState, formData: FormData) => {
      const result = await verifyMfaEnrollmentAction(_prev, formData);
      if (result.success && enrollment) {
        setVerifiedFactorId(enrollment.factorId);
        setEnrollment(null);
      }
      return result;
    },
    initialVerifyState,
  );

  function handleStartEnroll() {
    setEnrollError(null);
    startTransition(async () => {
      const result = await enrollMfaAction();
      if (result.error || !result.factorId || !result.qrCode || !result.secret) {
        setEnrollError(result.error ?? "No hemos podido iniciar la activación. Inténtalo de nuevo.");
        return;
      }
      setEnrollment({ factorId: result.factorId, qrCode: result.qrCode, secret: result.secret });
    });
  }

  function handleDisable() {
    if (!verifiedFactorId) return;
    startTransition(async () => {
      const result = await disableMfaAction(verifiedFactorId);
      if (result.success) setVerifiedFactorId(null);
    });
  }

  if (verifiedFactorId) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-emerald-700">Verificación en dos pasos activada ✓</p>
        <Button variant="secondary" onClick={handleDisable} disabled={isPending}>
          {isPending ? "Desactivando…" : "Desactivar"}
        </Button>
      </div>
    );
  }

  if (enrollment) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600">
          Escanea este código con Google Authenticator, Authy o tu app de verificación, o introduce la
          clave manualmente.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG data URI que devuelve Supabase, no un asset propio */}
        <img src={enrollment.qrCode} alt="Código QR para verificación en dos pasos" className="h-40 w-40 self-center" />
        <p className="break-all rounded-lg bg-surface-muted px-3 py-2 text-center text-xs text-zinc-600">
          {enrollment.secret}
        </p>
        <form action={verifyAction} className="flex flex-col gap-2">
          <input type="hidden" name="factorId" value={enrollment.factorId} />
          <label className="text-sm font-medium text-foreground">
            Código de 6 dígitos
            <Input name="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} required autoFocus className="mt-1" />
          </label>
          {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? "Verificando…" : "Confirmar y activar"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEnrollment(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-600">
        Añade una capa extra de seguridad: además de tu contraseña, te pediremos un código de tu móvil al
        iniciar sesión.
      </p>
      {enrollError && <p className="text-sm text-red-600">{enrollError}</p>}
      <Button variant="secondary" onClick={handleStartEnroll} disabled={isPending} className="self-start">
        {isPending ? "Preparando…" : "Activar verificación en dos pasos"}
      </Button>
    </div>
  );
}
