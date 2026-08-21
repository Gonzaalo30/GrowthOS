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

## Sprint 2.5 — Tutoriales por misión + Plan Autopilot (COMPLETADO 2026-08-21)
Adelantado desde Sprint 4 por petición directa del fundador: cada misión necesita un tutorial de "hazlo tú" y una vía de pago para "que lo hagamos nosotros", en vez de esperar al sprint de monetización completo.
- [x] Tutorial paso a paso en las 48 plantillas de misión (`MissionTemplate.tutorial`), desplegable en `MissionCard` ("¿Cómo lo hago?")
- [x] Plan Autopilot: suscripción mensual (99 €/mes, cubre misiones diarias + semanal, no Growth Sprints) — `/plan-autopilot`, checkout de Stripe (`app/actions/subscription.ts`), webhook (`app/api/stripe/webhook`) que actualiza `businesses.subscription_status`
- [x] Claves de Stripe (test mode) configuradas en local y Vercel; migración `0004_subscriptions.sql` aplicada
- [x] Ciclo de pago completo verificado en producción real: checkout → pago de prueba (tarjeta 4242) → redirección a éxito → webhook → `subscription_status = 'active'` con `stripe_customer_id`/`stripe_subscription_id` guardados

**Pendiente (no bloquea, es Sprint 4/futuro):** gating real de qué pasa con las misiones de un negocio en Autopilot — de momento el webhook solo guarda el estado de la suscripción, sin cambiar el comportamiento del dashboard (ver docs/DECISIONS.md).

**Incidencias reales encontradas y corregidas durante la puesta en marcha** (quedan documentadas porque son fáciles de repetir):
- El fundador pegó primero claves **live** de Stripe por error en vez de **test** — se descartaron sin usarlas y se le pidió regenerarlas por seguridad.
- La cuenta de Stripe tenía "Managed Payments" activado por defecto, que exige código de impuestos por producto — se desactivó con `managed_payments: { enabled: false }` en la sesión de checkout.
- Añadir variables de entorno en Vercel no redespliega solo — hace falta un Redeploy manual después.
- El primer webhook se creó estando en modo Live, así que no existía en modo Test — hubo que crearlo de nuevo dentro de Test mode.
- El webhook se creó con eventos equivocados (`customer.tax_id.*` en vez de `customer.subscription.*`) — corregido por API con la secret key en vez de repetir la navegación manual en el dashboard de Stripe.

## Sprint 3 — Auditoría automática + IA (EN CURSO 2026-08-21)
- [x] **Verificación real de misiones**: las ligadas a un hallazgo del análisis (`auditTrigger`: título, descripción, SSL, móvil) vuelven a comprobarse contra la web antes de marcarse como hechas — ya no basta con decir que sí. Botón "Verificar y marcar como hecha" para diferenciarlas honestamente de las que siguen siendo de confianza (responder reseña, subir foto — necesitan API de Google Business, Sprint 5). Si no pasa, mensaje claro sin marcar completada. Verificado con caso real: título de wikipedia.org sigue bloqueado, SSL se verifica y completa correctamente.
- [x] **Growth Score con historial** (`growth_score_history`): al volver al dashboard tras 7+ días desde el último análisis, se reanaliza el dominio y se actualiza el score. Si subió, banner "¡Enhorabuena! Tu Growth Score subió X puntos esta semana" (`ScoreCelebration`). Primera visita de un negocio existente solo guarda la base, sin celebrar (no hay con qué comparar).
- [x] **Desglose del Growth Score** (`growth_score_history.checks` jsonb): cada análisis guarda ahora el detalle de qué se comprobó, no solo el número. En el dashboard, botón "¿Por qué esta puntuación?" despliega cada check (SSL, título, descripción, H1, móvil) con su explicación en lenguaje de negocio (`ScoreBreakdown`, reutiliza `CheckItem` de `/analisis`). Deja claro que es un subconjunto — "iremos ampliando este análisis" — para no dar a entender que ya cubrimos velocidad real o Google Business.
- [x] **Growth Score por categorías con peso** (Velocidad, SEO, Local, Conversión, Confianza, tal como pide el prompt de producto): cada check tiene `category` (`lib/scoreCategories.ts`, separado de `lib/quickAudit.ts` a propósito — importarlo desde un componente cliente arrastraba sin querer el código de servidor con `node:dns`/`node:net` al bundle del navegador, bug real encontrado y corregido en el build). Local y Conversión muestran "—" honestamente: hoy no medimos nada en esas categorías, no se inventa una puntuación.
- [ ] Motor de auditoría completo (hoy `lib/quickAudit.ts` solo cubre SSL, título, descripción, H1, móvil — faltan schema, robots.txt, sitemap.xml, velocidad real, cookies, enlaces rotos)
- [ ] Integración IA (Claude/OpenAI) para traducir hallazgos a lenguaje de negocio — necesita API key, pendiente de pedir
- [ ] Emails automáticos semanales (Resend) — Growth Report

## Sprint 3.5 — Cuenta y navegación (COMPLETADO 2026-08-21)
Detectado por el fundador al usar la app real: no había ninguna forma de cerrar sesión, ni menú alguno una vez dentro — el dashboard era un callejón sin salida.
- [x] Cabecera de la app autenticada (`app/(app)/layout.tsx` + `AppHeader`): Dashboard · Marketplace · Mi cuenta · Cerrar sesión, con menú hamburguesa en móvil. Rutas `dashboard`, `marketplace` movidas al route group `(app)`.
- [x] `signOutAction` — **no existía ninguna forma de cerrar sesión en la app hasta ahora**, hueco básico ya cerrado.
- [x] Página `/account` (protegida): editar nombre, ver email (solo lectura), editar datos del negocio (dominio, tipo, ciudad, tamaño), ver estado del Plan Autopilot con enlace a suscribirse si no está activo.
- [x] `autoComplete` añadido a los campos que faltaban (ciudad → `address-level2`, dominio → `url`) para que el navegador rellene solo.
- [ ] Pendiente: login con Google (OAuth) — necesita que el fundador cree credenciales en Google Cloud Console primero.
- [ ] Pendiente: gestión de la suscripción desde `/account` (cancelar, cambiar de plan) — hoy solo se muestra el estado, cancelar requeriría el customer portal de Stripe o una acción de servidor propia.

## Sprint 3.6 — Alineación con el prompt de producto completo (COMPLETADO 2026-08-21)
El fundador volvió a pasar el prompt completo del producto para revisar qué faltaba. Comparado línea por línea con lo construido:
- [x] Precio de Schema corregido a 79€ (había una contradicción entre dos versiones del prompt: 179€ vs 79€ — se usa la del prompt más reciente, en `lib/opportunities.ts` y `/precios`)
- [x] Subtexto bajo el CTA de la landing: "Sin tarjeta · Menos de 30 segundos · Informe inmediato"
- [x] Saludo por hora del día en el dashboard ("Buenos días/tardes/noches, {nombre}") — calculado en el cliente (`features/dashboard/Greeting.tsx`), nunca en el servidor: Vercel corre en UTC, así que calcularlo en servidor le habría mostrado "Buenas noches" a un usuario en España a media tarde
- [x] Growth Score por categorías con peso (ver Sprint 3 arriba)
- [x] Tabla `case_studies` preparada (arquitectura lista, sin datos) para la "biblioteca de casos de éxito" que propuso el fundador — **decisión explícita: no rellenarla con casos inventados**. Con cero clientes reales todavía, un caso de éxito falso sería exactamente el tipo de contenido que este proyecto ha evitado en todo momento (ver `/casos-de-exito`, que ya usa ejemplos genéricos por el mismo motivo). Se activará sola en cuanto haya un caso real que documentar.

**Pendiente, más grande, para otro bloque:** onboarding como wizard de 5 pasos (Dominio → Tipo → Ciudad → Tamaño → Conexiones opcionales) tal como describe el prompt — hoy es un único formulario con los 4 primeros campos. El paso 5 (conectar Google Business/Search Console/GA4/WordPress) no puede ser funcional todavía porque esas integraciones OAuth son Sprint 5; se construiría como pasos visuales con las conexiones marcadas "Próximamente".

**Bug real encontrado durante este bloque:** añadir la constante `SCORE_CATEGORY_LABELS` directamente en `lib/quickAudit.ts` rompía el build — un componente cliente que la importaba arrastraba también el código de servidor del analizador (`node:dns`, `node:net`), que no existen en el navegador. Solución: separar las categorías a `lib/scoreCategories.ts`, sin ninguna dependencia de Node.

## Sprint 4 — Monetización
- Stripe para el marketplace (hoy `opportunity_requests` es solo captura de interés, sin cobro) y Growth Sprints
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
