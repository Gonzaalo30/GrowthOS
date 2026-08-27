import { LegalPage, LegalSection } from "@/features/legal/LegalPage";
import { LEGAL_INFO } from "@/lib/legalInfo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales en GrowthOS: qué recogemos, para qué, y tus derechos.",
  path: "/privacidad",
});

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <LegalSection title="1. Responsable del tratamiento">
        <ul className="flex flex-col gap-1">
          <li>
            <strong>Responsable:</strong> {LEGAL_INFO.fullName} ({LEGAL_INFO.tradeName})
          </li>
          <li>
            <strong>NIF:</strong> {LEGAL_INFO.nif}
          </li>
          <li>
            <strong>Domicilio:</strong> {LEGAL_INFO.address}
          </li>
          <li>
            <strong>Email de contacto:</strong> {LEGAL_INFO.contactEmail}
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Qué datos tratamos">
        <p>Solo los datos necesarios para que el servicio funcione:</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            <strong>Cuenta:</strong> nombre y email, al registrarte.
          </li>
          <li>
            <strong>Negocio:</strong> dominio de tu web, tipo de negocio, ciudad y tamaño de la empresa,
            que nos das en el alta.
          </li>
          <li>
            <strong>Uso del producto:</strong> tu Growth Score y su historial, las misiones que completas,
            tu XP, racha y logros — datos que genera el propio uso del servicio, no información que
            recojamos de terceros.
          </li>
          <li>
            <strong>Facturación:</strong> si contratas un plan de pago, tu nombre o razón social, NIF/CIF y
            dirección de facturación, si decides indicarlos. Los datos de tu tarjeta nunca pasan por
            nuestros servidores: los gestiona directamente Stripe.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>Prestarte el servicio: analizar tu web, generar tus misiones y mostrarte tu progreso.</li>
          <li>Gestionar tu cuenta y, si aplica, tu suscripción y facturación.</li>
          <li>Enviarte comunicaciones relacionadas con tu cuenta (confirmación de registro, avisos de tu Growth Score, notificaciones de la propia app).</li>
          <li>Mejorar el producto, a partir de estadísticas de uso agregadas.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base legal">
        <p>
          Tratamos tus datos porque son necesarios para ejecutar el contrato de prestación del servicio
          que aceptas al crear tu cuenta (art. 6.1.b RGPD), y en el caso de la facturación, para cumplir
          obligaciones legales (art. 6.1.c RGPD).
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién compartimos tus datos">
        <p>
          No vendemos ni cedemos tus datos a terceros con fines comerciales. Los compartimos únicamente
          con los proveedores que necesitamos para poder ofrecerte el servicio, actuando como encargados
          del tratamiento:
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            <strong>Supabase</strong> — base de datos y autenticación de tu cuenta.
          </li>
          <li>
            <strong>Stripe</strong> — procesamiento de pagos y facturación, si contratas un plan de pago.
          </li>
          <li>
            <strong>Vercel</strong> — alojamiento de la aplicación.
          </li>
        </ul>
        <p>
          Alguno de estos proveedores puede tratar datos fuera del Espacio Económico Europeo, siempre bajo
          garantías adecuadas (como cláusulas contractuales tipo de la Comisión Europea).
        </p>
      </LegalSection>

      <LegalSection title="6. Cuánto tiempo conservamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Si la cancelas, conservamos los datos de facturación el tiempo
          que exige la normativa fiscal, y eliminamos o anonimizamos el resto en un plazo razonable.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Puedes acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos, así como
          solicitar su portabilidad, escribiendo a{" "}
          <a href={`mailto:${LEGAL_INFO.contactEmail}`} className="text-brand-600 underline underline-offset-2">
            {LEGAL_INFO.contactEmail}
          </a>
          . También puedes editar tu nombre y los datos de tu negocio directamente desde &ldquo;Mi cuenta&rdquo;, o
          gestionar tus datos de facturación desde el Portal de Cliente de Stripe.
        </p>
        <p>
          Si consideras que no hemos atendido tu solicitud correctamente, puedes reclamar ante la Agencia
          Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2">
            www.aepd.es
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas razonables para proteger tus datos: conexión cifrada (HTTPS),
          contraseñas gestionadas por Supabase Auth (nunca almacenamos tu contraseña en texto plano), y
          acceso a los datos restringido por cuenta mediante reglas a nivel de base de datos (Row Level
          Security).
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios en esta política">
        <p>
          Si cambiamos esta política de forma sustancial, te avisaremos por email o mediante un aviso en
          la aplicación antes de que entre en vigor.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
