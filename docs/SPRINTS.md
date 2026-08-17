# GrowthOS — Plan de sprints

Regla: no se avanza al siguiente sprint hasta dejar el anterior funcional y limpio (sin mocks fingiendo ser features reales).

## Sprint 1 — Fundación (EN CURSO)
- [ ] Scaffold Next.js 15 + TypeScript + Tailwind + estructura de carpetas (`/app /components /features /lib /hooks /types /services /supabase`)
- [ ] Supabase: proyecto, schema (`profiles`, `businesses`, `missions`), Auth (email/password)
- [ ] Landing page (hero + input de URL + CTA "Analizar gratis")
- [ ] Registro (signup real contra Supabase Auth)
- [ ] Onboarding (dominio, tipo de negocio, ciudad, tamaño)
- [ ] Dashboard básico: `ScoreCircle` con Growth Score, lista de misiones diarias (`MissionCard`) marcables como completadas
- [ ] Deploy inicial a Vercel

## Sprint 2 — Gamificación
- Sistema de XP (persistido, se suma al completar misiones)
- Niveles (Starter → Scale) y `LevelBadge`
- Misión semanal (`MissionCard` variante de alto impacto)
- Marketplace de mejoras con precio cerrado (`OpportunityCard`)
- Streak de crecimiento (racha diaria + recompensas de contenido desbloqueable)

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
