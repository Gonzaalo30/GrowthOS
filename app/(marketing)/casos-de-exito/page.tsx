import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ejemplos por tipo de negocio",
  description:
    "Clínicas, restaurantes, inmobiliarias, talleres y ecommerce: mira el tipo de misiones diarias que recibirías en GrowthOS según tu sector.",
  path: "/casos-de-exito",
});

const EXAMPLES = [
  {
    type: "Clínica",
    missions: [
      "Responder las reseñas pendientes en Google",
      "Añadir horario y especialidades a la ficha de Google Business",
      "Publicar una foto reciente de la sala de espera",
    ],
  },
  {
    type: "Restaurante",
    missions: [
      "Actualizar el menú y los precios en la web",
      "Subir fotos recientes de los platos",
      "Activar la reserva de mesa desde el móvil",
    ],
  },
  {
    type: "Inmobiliaria",
    missions: [
      "Añadir datos estructurados a las fichas de propiedades",
      "Mejorar el título de las páginas de propiedades",
      "Comprobar que las propiedades cargan rápido en el móvil",
    ],
  },
  {
    type: "Taller",
    missions: [
      "Añadir zona de servicio y horario a Google Business",
      "Responder a preguntas frecuentes sobre precios",
      "Publicar fotos del taller y del equipo",
    ],
  },
  {
    type: "Ecommerce",
    missions: [
      "Mejorar las fotos del producto más vendido",
      "Dejar claro el coste de envío antes del carrito",
      "Simplificar el checkout para reducir carritos abandonados",
    ],
  },
];

export default function CasosDeExitoPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ejemplos por tipo de negocio
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Somos un producto nuevo, así que en vez de inventarnos testimonios, te enseñamos el tipo de
          misiones que recibirías según tu sector.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example, i) => (
          <Reveal key={example.type} delay={i * 0.06}>
            <GrowthCard interactive className="h-full">
              <h2 className="font-medium text-foreground">{example.type}</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {example.missions.map((mission) => (
                  <li key={mission} className="text-sm text-zinc-600">
                    · {mission}
                  </li>
                ))}
              </ul>
            </GrowthCard>
          </Reveal>
        ))}
      </div>

      <Link href="/" className="mx-auto">
        <Button className="mt-2">Ver mi Growth Score</Button>
      </Link>
    </div>
  );
}
