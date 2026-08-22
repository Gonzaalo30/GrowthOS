import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { ContactForm } from "@/features/contact/ContactForm";

export default async function ContactoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultName: string | undefined;
  let defaultEmail: string | undefined;
  if (user) {
    try {
      const profile = await getProfile(supabase, user.id);
      defaultName = profile.name;
      defaultEmail = profile.email;
    } catch {
      defaultEmail = user.email ?? undefined;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">¿Tienes dudas?</h1>
        <p className="mt-3 text-zinc-600">
          Escríbenos y te contestamos directamente. También puedes echar un vistazo a las{" "}
          <Link href="/faq" className="text-brand-600 underline underline-offset-2">
            preguntas frecuentes
          </Link>
          .
        </p>
      </div>

      <GrowthCard>
        <ContactForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </GrowthCard>
    </div>
  );
}
