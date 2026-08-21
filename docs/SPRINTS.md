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

**Bug real encontrado durante este bloque:** añadir la constante `SCORE_CATEGORY_LABELS` directamente en `lib/quickAudit.ts` rompía el build — un componente cliente que la importaba arrastraba también el código de servidor del analizador (`node:dns`, `node:net`), que no existen en el navegador. Solución: separar las categorías a `lib/scoreCategories.ts`, sin ninguna dependencia de Node.

## Sprint 3.7 — Onboarding como wizard de 5 pasos (COMPLETADO 2026-08-21)
- [x] `features/onboarding/OnboardingForm.tsx` reescrito como wizard de 5 pasos (Dominio → Tipo de negocio → Ciudad → Tamaño → Conexiones opcionales), con barra de progreso, validación por paso y botón "Atrás". El contrato con el servidor no cambia: los 4 campos reales viajan en inputs ocultos dentro del mismo `<form>` y se envían a `completeOnboardingAction` tal cual, solo cambió la experiencia de captura.
- [x] Paso 5 (conexiones) muestra Google Business Profile / Search Console / GA4 / Plugin WordPress con etiqueta "Próximamente" — no funcional porque esas integraciones OAuth son Sprint 5, pero visible para que el usuario sepa que existirán.
- [x] Selección de tipo de negocio y tamaño de empresa pasaron de `<select>` a tarjetas pulsables (más cercano al estilo Duolingo del resto del producto).

**Bug real encontrado y corregido durante la verificación de este bloque:** al probar el wizard completo con una cuenta que ya tenía un negocio, `completeOnboardingAction` creó un segundo registro en `businesses` para el mismo `owner_id`, y `getBusinessByOwner` (que espera una única fila) rompió el dashboard con `PGRST116 — multiple rows returned`. La causa es que `/onboarding` solo redirige a `/dashboard` si ya existe negocio *antes* de renderizar el formulario, pero nada impide un segundo submit si el usuario vuelve a esa URL. No es un bug introducido por el wizard (el formulario de un solo paso tenía el mismo riesgo), pero quedó expuesto durante las pruebas. Fix aplicado de inmediato: se borró la fila duplicada (confirmado con el fundador antes de borrar). **Pendiente real de robustez, no bloqueante para este sprint:** añadir una restricción `unique(owner_id)` en `businesses` para que esto sea imposible a nivel de base de datos en vez de solo a nivel de UI.

## Sprint 3.8 — Landing con más "wow" (COMPLETADO 2026-08-21)
El fundador mandó una lista larga de ideas de producto tras usarlo. De la parte que marcó como "urgente, lo haría primero":
- [x] Preview en vivo en el Hero: al escribir un dominio (debounce 900ms), aparece a la derecha del input una tarjeta con Growth Score, nº de acciones pendientes y potencial de mejora — **con datos reales** (server action `app/actions/heroPreview.ts` que llama a `runQuickAudit`), no inventados. El fundador pedía una "preview falsa hasta que cargue"; se implementó con auditoría real en su lugar para no romper el principio de cero datos falsos del proyecto — mismo efecto sorpresa, sin mentir.
- [x] CTA cambiado de "Analizar gratis" a "Ver mi Growth Score" (más específico, ligado a la métrica central del producto). Nota: no hay test A/B real todavía — eso depende de la infraestructura de feature flags/analytics que el fundador pidió más abajo en su lista y que sigue sin construirse (ver backlog).
- [x] Barra de confianza con iconos (30 segundos / Sin tarjeta / Sin conocimientos técnicos) en vez de solo texto.
- [x] Animación de auditoría por pasos en `/analisis` (`features/landing/AuditLoadingSteps.tsx`, sustituye al `Suspense` fallback de texto plano) — 3 pasos con check ✓ progresivo, con nombres que corresponden a categorías que **sí** auditamos de verdad (velocidad/móvil, SEO, seguridad), no a integraciones que no existen (el fundador proponía "Buscando Google Business", pero esa comprobación no existe hasta Sprint 5 — cambiar el paso por algo real en vez de simular una capacidad que no tenemos).
- [x] Confeti al revelar el resultado (`components/growth/ConfettiBurst.tsx`, CSS/framer-motion, sin librería nueva) en la tarjeta de score de `/analisis`.

**Bug real encontrado y corregido:** el panel de preview del Hero se quedaba congelado mostrando el esqueleto de carga para siempre, aunque el servidor ya había devuelto el resultado (confirmado con logs: el estado se actualizaba correctamente). Causa: `AnimatePresence mode="wait"` con una `key` que cambiaba de `"loading"` a `preview.domain` interrumpía la animación de salida del esqueleto a mitad de camino y nunca completaba el montaje del contenido nuevo. Arreglado usando una `key` estable (`"panel"`) para el contenedor y dejando que el contenido interior cambie sin remontar el `motion.div` exterior.

### Backlog priorizado (resto de la lista del fundador, no construido todavía)
Todo lo que sigue viene de la misma lista de ideas. Se documenta para no perderlo, agrupado por tamaño/dependencias — no implica orden de sprint todavía, eso se decide con el fundador:

**Dashboard con más personalidad**
- Racha (🔥) y "hoy puedes ganar N XP" más visibles junto al saludo — hoy el saludo y el streak existen pero por separado, no combinados en una sola frase con gancho.
- Calendario de crecimiento estilo GitHub (cuadrícula de días, color según nº de misiones completadas ese día) — requiere guardar actividad diaria por negocio, no solo el contador de racha actual.
- Renombrar "misión diaria" a "Quick Win" con numeración (#27) — cambio de copy + contador global de misiones completadas por negocio.
- La misión semanal con tratamiento visual de "boss" (mucho más grande, con precio/impacto destacado) — hoy ya tiene borde diferenciado pero no ese peso visual.
- Marketplace renombrado a "Centro de Mejoras" + filtros (Todos/SEO/Google/Velocidad/Conversiones) — los filtros necesitan una `category` en `opportunities` (similar a la que ya existe en los checks de auditoría).

**Gamificación nueva**
- Cofre diario (XP / nueva misión / descuento 5% / informe premium al azar) — mecánica nueva, necesita definir qué recompensas son reales antes de construirlas (nada de "informe premium" si no existe todavía).
- Multiplicador de XP por rachas de Quick Wins seguidos.

**Funcionalidades más grandes**
- Comparador de competidores mostrando "te adelantó esta semana" (ya estaba en el roadmap de Sprint 4, ahora con este enfoque más accionable).
- Roadmap 90 días con checklist estilo Notion (pendiente/en progreso/completada) — ya estaba en Sprint 4, se afina el diseño.
- Growth Sprint renombrado por resultado ("Crecimiento Local" en vez de "SEO Sprint").
- **Growth Replay** (la idea que más nos gustó): guardar antes/después real del Growth Score de un negocio con las misiones que lo explican, como un "replay" de progreso. Es honesto por diseño porque usa `growth_score_history` (que ya existe desde el Sprint 3) — no requiere inventar nada, solo visualizarlo bien. Buen candidato para el próximo bloque grande.

**Infraestructura (pidió meterla ahora porque luego cuesta más)**
- Feature flags (activar/desactivar funcionalidades sin redeploy).
- Eventos de analytics (clic en CTA, auditoría iniciada, misión completada, compra, abandono).
- Sistema de notificaciones (email/in-app/push) diseñado desde la base, no añadido después.
- Cola de auditorías en vez de ejecutarlas directamente (para escalar).

**Identidad de marca**
- Mascota naranja (radar/cohete con ojos) como voz del producto en vez de un tono neutro de sistema — mensajes tipo "He encontrado una oportunidad" / "Llevas 5 días sin completar una misión". Decisión de marca, no solo de código — mejor validarla con el fundador (naming, diseño del personaje) antes de escribirla en todos los textos del producto.

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
