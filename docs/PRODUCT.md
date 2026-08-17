# GrowthOS — Producto

## Propuesta de valor

Auditor de crecimiento gamificado para pequeños negocios no técnicos (clínicas, restaurantes, inmobiliarias, talleres, hoteles, autónomos, PYMEs).

> "No te decimos qué está mal. Te decimos qué hacer hoy."

Nunca tecnicismos sin traducir a lenguaje de negocio. No es un dashboard analítico (no SEMrush). Es una experiencia tipo videojuego (piensa Duolingo) orientada a hábito diario y conversión hacia servicios/mejoras de pago.

## Usuario objetivo

Dueño de un único negocio (no agencias multi-cliente). Modelo de datos: **1 cuenta = 1 negocio** para el MVP.

## Flujo de usuario

1. **Landing** — Hero: "Descubre cuántas oportunidades está perdiendo tu negocio online". Input de URL + botón "Analizar gratis".
2. **Registro** — tras el análisis gratuito: nombre, email, password.
3. **Onboarding** — dominio, tipo de negocio, ciudad, tamaño de empresa. Conexiones opcionales (futuras): Google Business, WordPress, GSC, GA4.
4. **Dashboard principal** (estilo videojuego):
   - Growth Score: círculo grande (ej. 68/100) + potencial de crecimiento
   - 3 misiones diarias + 1 misión semanal + 2 oportunidades importantes
5. **Marketplace** — mejoras con precio cerrado, sin presupuestos.
6. **Growth Sprint** — servicios premium 1.000–5.000€ con landing propia.
7. **Roadmap 90 días** — generado por IA, 3 fases de 30 días, tareas coloreadas verde/naranja/roja.
8. **Comparador de competidores** — tabla de fortalezas/debilidades/oportunidades, nunca rankings.
9. **Emails semanales** (Resend) — Growth Report con cambios de la semana.

## Sistema de gamificación

- **XP**: misión diaria +10, misión semanal +50, conectar WordPress +100, contratar mejora +250, Growth Sprint +1000.
- **Niveles**: Starter → Explorer → Optimizer → Growth Pro → Scale. Desbloquean auditorías ilimitadas, comparativa de competidores, roadmap 90 días, descuentos, nuevos informes. **Nunca regalar trabajo humano como recompensa de nivel** — protege el margen del ticket alto.
- **Streak de crecimiento**: racha diaria estilo Duolingo. Día 7 → informe especial. Día 30 → insignia. Recompensa = contenido/análisis desbloqueable generado por IA, nunca trabajo humano gratis.

## Auditoría automática (Sprint 3)

Analiza: SSL, meta title/description, H1, schema, robots, sitemap, velocidad, mobile, cookies, enlaces rotos. Se guarda en Supabase. La IA traduce cada hallazgo a lenguaje simple (ej. no "Falta JSON-LD" sino "Google podría entender mejor tu negocio").

## Componentes reutilizables requeridos

`GrowthCard`, `MissionCard`, `XPBar`, `LevelBadge`, `OpportunityCard`, `SprintCard`, `ScoreCircle` — todos responsive, mobile-first.

## Branding

- Naranja `#F97316`, negro, blanco.
- Estética moderna, premium, minimalista — nivel visual de Linear, Notion, Stripe.
- Animaciones con Framer Motion: subida de XP, confeti, barra de progreso, hover premium, transición entre niveles. Sin excesos.
