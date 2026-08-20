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

## Sprint 2 — Gamificación
- [x] Sistema de XP (persistido en `businesses.xp`, incremento atómico vía `increment_business_xp`, se suma al completar misiones)
- [x] Niveles (Starter → Scale) y `LevelBadge` + `XPBar` con progreso hacia el siguiente nivel
- Misión semanal (`MissionCard` variante de alto impacto) — ya existe la mecánica base desde Sprint 1, revisar si necesita distinción visual adicional
- Marketplace de mejoras con precio cerrado (`OpportunityCard`)
- Marketplace de mejoras con precio cerrado (`OpportunityCard`)
- Streak de crecimiento (racha diaria + recompensas de contenido desbloqueable)
- **Rotación de misiones diarias**: hoy las 3+1 se siembran una única vez en el alta (`lib/missionTemplates.ts`, 36 diarias + 12 semanales con prioridad alta/media/baja). Falta el sistema que sirva misiones *nuevas* cada día sin repetir las ya completadas hasta agotar la variedad, respetando el orden alta → media → baja. Seguir ampliando la librería de contenido en paralelo (más "tonterías" y más profundidad por sector) — feedback del fundador: con 3 misiones/día x 90 días (270 huecos) la librería debe seguir creciendo.

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
