import Link from "next/link";
import { LegalPage, LegalSection } from "@/features/legal/LegalPage";
import { LEGAL_INFO } from "@/lib/legalInfo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Aviso legal",
  description: "Identificación del titular de GrowthOS y condiciones legales del sitio.",
  path: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal">
      <LegalSection title="1. Titular del sitio web">
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
          de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
        </p>
        <ul className="flex flex-col gap-1">
          <li>
            <strong>Titular:</strong> {LEGAL_INFO.fullName}
          </li>
          <li>
            <strong>Nombre comercial:</strong> {LEGAL_INFO.tradeName}
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

      <LegalSection title="2. Objeto">
        <p>
          GrowthOS es una plataforma que analiza la presencia online de pequeños negocios (webs de
          clínicas, restaurantes, inmobiliarias, talleres, hoteles, tiendas online y otros) y les propone
          acciones concretas (&ldquo;misiones&rdquo;) para mejorar su Growth Score, con un sistema de gamificación,
          mejoras opcionales de pago y planes de suscripción.
        </p>
      </LegalSection>

      <LegalSection title="3. Condiciones de uso">
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario y supone la aceptación, desde
          ese mismo momento, de las condiciones aquí publicadas, así como de nuestros{" "}
          <Link href="/terminos" className="text-brand-600 underline underline-offset-2">
            Términos y Condiciones
          </Link>{" "}
          y nuestra{" "}
          <Link href="/privacidad" className="text-brand-600 underline underline-offset-2">
            Política de Privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <p>
          El diseño del sitio web, el código fuente, los textos, la marca &ldquo;{LEGAL_INFO.tradeName}&rdquo; y los
          demás contenidos son propiedad de {LEGAL_INFO.fullName} o se usan con la debida autorización.
          Queda prohibida su reproducción total o parcial sin autorización expresa.
        </p>
      </LegalSection>

      <LegalSection title="5. Exclusión de responsabilidad">
        <p>
          Nos esforzamos por que la información y el análisis que ofrecemos sea correcto y esté
          actualizado, pero no garantizamos resultados de negocio concretos, ya que estos dependen en
          buena parte de factores fuera de nuestro control (cambios en Google, en la competencia, en el
          propio negocio del usuario, etc.).
        </p>
      </LegalSection>

      <LegalSection title="6. Legislación aplicable">
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier controversia serán
          competentes los juzgados y tribunales que correspondan conforme a la normativa de protección de
          consumidores y usuarios aplicable.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
