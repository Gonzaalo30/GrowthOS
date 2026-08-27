import Link from "next/link";
import { LegalPage, LegalSection } from "@/features/legal/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de cookies",
  description: "Qué cookies usa GrowthOS y cómo puedes gestionarlas o desactivarlas.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <LegalSection title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que un sitio web guarda en tu navegador para recordar
          información, como que has iniciado sesión.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué cookies usamos">
        <p>
          Hoy en día usamos exclusivamente una cookie técnica y estrictamente necesaria: la que gestiona
          Supabase Auth para mantener tu sesión iniciada mientras usas GrowthOS. Sin ella, no podrías
          entrar en tu cuenta ni ver tu Growth Score y tus misiones.
        </p>
        <p>No usamos cookies de analítica, publicidad ni seguimiento de terceros.</p>
      </LegalSection>

      <LegalSection title="3. Por qué no pedimos tu consentimiento">
        <p>
          La normativa española (LSSI-CE) no exige consentimiento para las cookies estrictamente
          necesarias para prestar el servicio que has solicitado, como la de inicio de sesión. Por eso no
          verás un banner de cookies: no tenemos ninguna cookie que lo requiera.
        </p>
      </LegalSection>

      <LegalSection title="4. Cómo desactivar las cookies">
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu navegador, pero ten en
          cuenta que si desactivas la cookie de sesión no podrás iniciar sesión en GrowthOS.
        </p>
      </LegalSection>

      <LegalSection title="5. Si esto cambia">
        <p>
          Si en el futuro añadimos analítica o publicidad que use cookies no esenciales, actualizaremos
          esta página y te pediremos tu consentimiento antes de activarlas. Consulta también nuestra{" "}
          <Link href="/privacidad" className="text-brand-600 underline underline-offset-2">
            Política de Privacidad
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
