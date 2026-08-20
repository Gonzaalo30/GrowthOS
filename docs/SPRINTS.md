# GrowthOS — Plan de sprints

Regla: no se avanza al siguiente sprint hasta dejar el anterior funcional y limpio (sin mocks fingiendo ser features reales).

## Sprint 1 — Fundación (COMPLETADO 2026-08-17)
- [x] Scaffold Next.js 15 + TypeScript + Tailwind + estructura de carpetas (`/app /components /features /lib /hooks /types /services /supabase`)
- [x] Supabase: proyecto, schema (`profiles`, `businesses`, `missions`), Auth (email/password)
- [x] Landing page (hero + input de URL + CTA "Analizar gratis")
- [x] Registro (signup real contra Supabase Auth) + Login (añadido fuera del plan original — necesario para que un usuario recurrente pueda volver a entrar)
- [x] Onboarding (dominio, tipo de negocio, ciudad, tamaño)
- [x] Dashboard básico: `ScoreCircle` con Growth Score, lista de misiones diarias (`MissionCard`) marcables como completadas
- [x] Deploy inicial a Vercel — [growth-os-smoky-eta.vercel.app](https://growth-os-smoky-eta.vercel.app)

Verificado de extremo a extremo en producción real (no local): registro, login, onboarding, creación de negocio, siembra de misiones y completado de misión, todo persistido en Supabase. Pendiente antes de abrir al público: SMTP propio vía Resend (ver docs/DECISIONS.md, el email de confirmación de Supabase por defecto está muy limitado en volumen).

## Sprint 2 — Gamificación (COMPLETADO 2026-08-20)
- [x] Sistema de XP (persistido en `businesses.xp`, incremento atómico vía `increment_business_xp`, se suma al completar misiones)
- [x] Niveles (Starter → Scale) y `LevelBadge` + `XPBar` con progreso hacia el siguiente nivel
- [x] Misión semanal destacada — `MissionCard` con estilo visual diferenciado (borde, degradado, etiqueta "⭐ Alto impacto") cuando `type === "weekly"`
- [x] Marketplace de mejoras con precio cerrado (`OpportunityCard`, ruta protegida `/marketplace`) — sin pago todavía (llega con Stripe en Sprint 4), "Aplicar esta mejora" registra una solicitud real en `opportunity_requests`
- [x] Streak de crecimiento (`businesses.streak_count` + `last_activity_date`, función SQL `register_business_activity` atómica) — `StreakBadge` con hitos visuales en 7 y 30 días. Recompensa de contenido desbloqueable (informe especial día 7, insignia día 30) queda pendiente de Sprint 3 cuando exista generación de contenido con IA — de momento el streak es real y se ve, pero no desbloquea nada adicional todavía
- [x] Rotación de misiones diarias (`ensureDailyMissions` en `services/mission.service.ts`, se ejecuta al cargar el dashboard): completa el hueco hasta 3 misiones diarias pendientes con plantillas nunca usadas por ese negocio (`missions.template_id`); si se agota la variedad, repite empezando por las completadas hace más tiempo, sin duplicar nunca una misión que ya esté pendiente

**Decisión explícita (no construido):** subir de nivel no desbloquea todavía "comparativa de competidores" ni "roadmap 90 días" — esas funciones no existen aún (Sprint 4). Se enganchará al sistema de niveles cuando se construyan, en vez de simular un desbloqueo de algo que no existe.

**Seguir ampliando en paralelo:** la librería de misiones (36 diarias + 12 semanales) sigue siendo pequeña frente a 3 misiones/día × 90 días = 270 huecos; seguirá creciendo con el feedback del fundador.

## Sprint 3 — Auditoría automática + IA
- Motor de auditoría (SSL, meta tags, H1, schema, robots, sitemap, velocidad, mobile, cookies, enlaces rotos)
- Persistencia de resultados en Supabase
- Integración IA (Claude/OpenAI) para traducir hallazgos a lenguaje de negocio
- Emails automáticos semanales (Resend) — Growth Report

## Sprint 4 — Monetización
- Stripe (checkout de mejoras del marketplace y Growth Sprints)
- Landings de Growth Sprint (Performance/SEO/Local/Conversion, 1.000–5.000€)
- Roadmap 90 días generado por IA (3 fases, tareas verde/naranja/roja)
- Comparador de competidores (2 competidores → tabla IA)

## Sprint 5 — Integraciones
- Plugin WordPress (integración futura, no parte del core SaaS)
- OAuth Google Business
- OAuth Google Search Console + GA4

## Fuera de alcance del MVP (explícito)
- Multi-tenant / múltiples negocios por cuenta (posible pivote a agencias, no ahora)
- Cualquier flujo que pida contraseñas de terceros directamente (siempre OAuth)
