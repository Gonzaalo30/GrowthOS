import Link from "next/link";
import { LegalPage, LegalSection } from "@/features/legal/LegalPage";
import { LEGAL_INFO } from "@/lib/legalInfo";

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <LegalSection title="1. Objeto y aceptación">
        <p>
          Estos términos regulan el uso de GrowthOS, un servicio ofrecido por {LEGAL_INFO.fullName}{" "}
          (NIF {LEGAL_INFO.nif}). Al crear una cuenta, aceptas estos términos, nuestra{" "}
          <Link href="/privacidad" className="text-brand-600 underline underline-offset-2">
            Política de Privacidad
          </Link>{" "}
          y nuestro{" "}
          <Link href="/aviso-legal" className="text-brand-600 underline underline-offset-2">
            Aviso Legal
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Descripción del servicio">
        <p>
          GrowthOS analiza tu web y te propone misiones diarias y semanales concretas para mejorar tu
          Growth Score. Incluye un sistema de gamificación (XP, niveles, racha, cofre diario, logros), un
          Centro de Mejoras con mejoras puntuales de precio cerrado, y planes de suscripción (Gratis,
          Growth, Autopilot y Personalizado) descritos en{" "}
          <Link href="/precios" className="text-brand-600 underline underline-offset-2">
            /precios
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="3. Registro y cuenta">
        <p>
          Para usar GrowthOS necesitas crear una cuenta con un email válido. Eres responsable de mantener
          la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta. Los datos
          que nos des sobre tu negocio deben ser reales y estar actualizados.
        </p>
      </LegalSection>

      <LegalSection title="4. Planes, precios y facturación">
        <p>
          El plan Gratis no tiene coste. Los planes Growth y Autopilot son suscripciones mensuales que se
          cobran de forma recurrente a través de Stripe, sin permanencia: puedes cancelarlas o cambiar de
          plan cuando quieras desde &ldquo;Mi cuenta&rdquo;. El plan Personalizado se acuerda caso a caso tras
          contactar con nosotros, y su precio se comunica antes de cualquier cobro.
        </p>
        <p>
          Las mejoras del Centro de Mejoras tienen un precio cerrado que se te muestra antes de
          solicitarlas. Solicitar una mejora inicia una conversación con nosotros para acordar los
          detalles; el cobro no se produce hasta que confirmemos el encargo contigo.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso aceptable">
        <p>
          No puedes usar GrowthOS para actividades ilegales, para intentar acceder sin autorización a
          nuestros sistemas o a las cuentas de otros usuarios, ni para sobrecargar o interferir con el
          funcionamiento del servicio.
        </p>
      </LegalSection>

      <LegalSection title="6. Propiedad intelectual">
        <p>
          El software, el diseño y los contenidos de GrowthOS son propiedad de {LEGAL_INFO.fullName}. Tú
          conservas la propiedad de los datos de tu negocio que nos facilitas; nos das permiso para
          usarlos únicamente para prestarte el servicio.
        </p>
      </LegalSection>

      <LegalSection title="7. Límite de responsabilidad">
        <p>
          GrowthOS te ayuda a identificar y priorizar mejoras, pero no puede garantizar resultados de
          negocio concretos (más clientes, más ventas, mejor posición en Google), ya que dependen de
          factores fuera de nuestro control. No somos responsables de decisiones que tomes basándote
          únicamente en el análisis, ni de cambios en servicios de terceros (como Google) que afecten a tu
          Growth Score.
        </p>
      </LegalSection>

      <LegalSection title="8. Cancelación y baja">
        <p>
          Puedes cancelar tu suscripción de pago en cualquier momento desde el Portal de Cliente de
          Stripe, accesible desde &ldquo;Mi cuenta&rdquo;. La cancelación se aplica al final del periodo ya pagado. Si
          quieres eliminar tu cuenta por completo, escríbenos a{" "}
          <a href={`mailto:${LEGAL_INFO.contactEmail}`} className="text-brand-600 underline underline-offset-2">
            {LEGAL_INFO.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Modificación de estos términos">
        <p>
          Podemos actualizar estos términos para reflejar cambios en el servicio o en la normativa
          aplicable. Si el cambio es sustancial, te avisaremos con antelación razonable por email o dentro
          de la aplicación.
        </p>
      </LegalSection>

      <LegalSection title="10. Legislación aplicable">
        <p>
          Estos términos se rigen por la legislación española. Para cualquier controversia, y sin
          perjuicio de los derechos que la normativa de consumidores te reconozca, serán competentes los
          juzgados y tribunales que correspondan conforme a dicha normativa.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
