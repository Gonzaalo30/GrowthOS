import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { FaqAccordion, type FaqItem } from "@/features/faq/FaqAccordion";

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    title: "General",
    items: [
      {
        question: "¿Qué es GrowthOS?",
        answer:
          "Una herramienta que analiza tu web de verdad y te dice, en el lenguaje de tu negocio y no en jerga técnica, qué hacer hoy para mejorarla. Nada de dashboards que no sabes leer: misiones concretas de 1-5 minutos.",
      },
      {
        question: "¿Para qué tipos de negocio sirve?",
        answer:
          "Hoy tenemos misiones específicas para clínicas, restaurantes, inmobiliarias, talleres, hoteles, ecommerce y autónomos/PYMEs en general. Si tu sector no encaja exactamente en ninguno, igualmente recibes las misiones universales (SEO, velocidad, seguridad, conversión).",
      },
      {
        question: "¿Necesito conocimientos técnicos?",
        answer:
          "No. Cada misión trae un tutorial paso a paso pensado para alguien sin conocimientos de programación. Si prefieres no ocuparte tú, el Plan Autopilot lo hace por ti.",
      },
    ],
  },
  {
    title: "Cómo funciona",
    items: [
      {
        question: "¿Cómo sabéis qué está fallando en mi web?",
        answer:
          "Analizamos tu web de verdad: conexión segura, título y descripción, encabezados, si se adapta al móvil, datos estructurados, robots.txt, sitemap, velocidad de respuesta real y enlaces rotos. Nada inventado — si algo no lo medimos todavía, te lo decimos honestamente en vez de fingir una puntuación.",
      },
      {
        question: "¿Qué es un Quick Win?",
        answer:
          "Una misión diaria de 1-5 minutos, elegida priorizando las oportunidades de mejora más importantes que detectamos en tu web. Al completarla ganas XP, y algunas se verifican de verdad volviendo a analizar tu web antes de darlas por hechas.",
      },
      {
        question: "¿Qué es el Centro de Mejoras?",
        answer:
          "Mejoras con precio cerrado (sin presupuestos ni sorpresas) para cuando una misión requiere trabajo técnico y prefieres que la hagamos nosotros en vez de hacerla tú.",
      },
      {
        question: "¿Con qué plataformas sois compatibles (Autopilot y Centro de Mejoras)?",
        answer:
          "Trabajamos con WordPress, Shopify, Wix y sitios a medida. Cuando toca implementar algo por ti, te pedimos el acceso que corresponda a tu caso (usuario de administrador, FTP, etc.) — no hay una plataforma que no podamos tocar.",
      },
      {
        question: "¿Cada cuánto se actualiza mi Growth Score?",
        answer:
          "Automáticamente cada 7 días. Si estás en el plan Growth o Autopilot, puedes reanalizar tu web cuando quieras desde el dashboard, sin esperar al ciclo automático.",
      },
    ],
  },
  {
    title: "Precios y planes",
    items: [
      {
        question: "¿Cuánto cuesta GrowthOS?",
        answer:
          "Tienes un plan Gratis para empezar, Growth a 29€/mes, Autopilot a 99€/mes, y un plan Personalizado para encargos más grandes. Todos los detalles están en la página de precios.",
      },
      {
        question: "¿Puedo cambiar o cancelar mi plan cuando quiera?",
        answer:
          "Sí, sin permanencia. Desde \"Mi cuenta\" puedes cambiar entre Growth y Autopilot o cancelar tu suscripción en cualquier momento a través del Portal de Cliente de Stripe.",
      },
      {
        question: "¿Qué diferencia hay entre Growth y Autopilot?",
        answer:
          "Con Growth sigues haciendo tú las misiones, pero sin límite diario y con reanálisis bajo demanda. Con Autopilot, además de todo eso, implementamos tus misiones diarias y semanales por ti.",
      },
      {
        question: "¿Y si necesito algo más grande o personalizado?",
        answer:
          "Escríbenos desde el plan Personalizado en la página de precios (o desde esta página de contacto) y hablamos de tu caso concreto antes de acordar cualquier precio.",
      },
    ],
  },
  {
    title: "Cuenta y datos",
    items: [
      {
        question: "¿Mis datos están seguros?",
        answer:
          "Sí. Usamos conexión cifrada, no guardamos tu contraseña en texto plano, y los datos de tu tarjeta nunca pasan por nuestros servidores — los gestiona Stripe directamente. Todos los detalles están en la Política de Privacidad.",
      },
      {
        question: "¿Puedo pedir factura?",
        answer:
          "Sí. Desde \"Mi cuenta\" puedes indicar tu nombre o razón social, NIF/CIF, dirección y país, y ver el historial completo de tus facturas reales con descarga en PDF.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-lg text-zinc-600">Todo lo que necesitas saber antes de empezar.</p>
      </div>

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {group.title}
            </h2>
            <FaqAccordion items={group.items} />
          </div>
        ))}
      </div>

      <GrowthCard className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 text-center">
        <p className="text-sm text-zinc-600">¿No has encontrado lo que buscabas?</p>
        <Link href="/contacto">
          <Button variant="secondary">Escríbenos</Button>
        </Link>
      </GrowthCard>
    </div>
  );
}
