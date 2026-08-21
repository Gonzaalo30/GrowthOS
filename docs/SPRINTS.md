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

- [x] **Gestión real de la suscripción** (2026-08-22): botón "Gestionar suscripción" en `/account` que lleva al Portal de Cliente real de Stripe (`stripe.billingPortal.sessions.create`) — cancelar, cambiar método de pago, ver facturas, todo gestionado por Stripe, sin lógica de cancelación propia. Verificado de extremo a extremo en local contra Stripe test mode: suscripción real → aparece "Gestionar suscripción" → portal real → cancelar → webhook actualiza `subscription_status` a `canceled` solo. Se probó también el caso de error (sin `stripe_customer_id`) con un mensaje claro en la página en vez de un fallo silencioso.
- [x] **Datos de facturación + historial de facturas reales** (2026-08-22), a petición del fundador ("dejar sacar facturas, más pro y completa"): formulario en `/account` (nombre/razón social, NIF-CIF, dirección) que se guarda directamente en el cliente de Stripe (`services/billing.service.ts` — nombre y dirección vía `customers.update`, NIF/CIF como Tax ID real de Stripe, no un campo suelto, para que salga de verdad en el PDF) y listado del historial de facturas reales con enlace de descarga al PDF real de Stripe (`components/account/InvoiceHistory.tsx`). Sin generar ni guardar PDFs propios — Stripe ya lo hace bien y de forma fiscalmente correcta, reinventarlo habría sido puro riesgo. Solo se muestra si el negocio ya tiene `stripe_customer_id` (ha pasado por checkout al menos una vez); si no, no aparece nada (nunca una sección de facturación vacía fingiendo tener datos). Verificado de extremo a extremo con datos reales: formulario guardado, recargado y confirmado en Stripe, PDF real descargado.

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
- [x] **Motor de auditoría ampliado** (2026-08-21): de 5 a 10 checks reales. Nuevos: datos estructurados (schema.org / JSON-LD), `robots.txt`, `sitemap.xml`, velocidad de respuesta real (tiempo medido del propio fetch, no una API externa de PageSpeed), y una muestra de hasta 5 enlaces internos comprobados por si están rotos (404/5xx) — un fallo de red nuestro no cuenta como enlace roto del sitio, para no acusar en falso. Cookies/consentimiento se evaluó y se descartó por ahora: no hay forma fiable de detectarlo con heurísticas de texto sin bastante riesgo de falsos positivos/negativos, y este proyecto prefiere no medir algo a medirlo mal.
- [x] **Bug real de hidratación encontrado y corregido**: `ConfettiBurst` generaba las partículas con `Math.random()` directamente en el render (`useMemo`), y como se renderiza dentro de un Server Component, el servidor y el cliente sacaban valores distintos → error de hidratación de React en cada carga de `/analisis`. Solución: las partículas se generan en un `useEffect` (solo cliente), nunca durante el render inicial — mismo patrón que ya se usa en `Greeting.tsx` para la hora local.
- [x] **5 misiones nuevas** para los checks que amplían el motor (`daily-add-schema`, `daily-add-robots`, `daily-add-sitemap`, `daily-improve-speed`, `daily-fix-broken-links`) — sin esto, el motor detectaba problemas nuevos pero no había ninguna misión que explicara cómo arreglarlos, rompiendo la promesa central del producto ("te decimos qué hacer hoy").
- [x] **Bug real encontrado y corregido en la rotación de misiones**: `ensureDailyMissions` se llamaba siempre con un `Set()` vacío de checks fallidos (`app/(app)/dashboard/page.tsx`), así que el boost de prioridad para misiones ligadas a un problema real detectado (`scoreTemplate`) nunca tenía efecto — la rotación elegía a ciegas. Corregido pasando los checks fallidos reales del último desglose guardado.
- [ ] Integración IA (Claude/OpenAI) para traducir hallazgos a lenguaje de negocio, comparador de competidores y roadmap 90 días — necesita API key, el fundador decidió esperar y seguir con otras cosas mientras tanto
- [ ] Emails automáticos semanales (Resend) — Growth Report
- [ ] Detectado de paso, no bloqueante: el check `h1` no tiene ninguna misión asociada (`auditTrigger`) — es el único de los checks "antiguos" sin una vía de acción. Pendiente para un próximo bloque de misiones.

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

## Sprint 3.9 — Backlog del fundador: dashboard, gamificación e infra (COMPLETADO 2026-08-21)
El fundador pidió seguir con el resto de la lista de ideas. Construido en este bloque:

**Dashboard con más personalidad**
- [x] Racha (🔥) y "hoy puedes ganar N XP" combinados en una sola línea junto al saludo.
- [x] Calendario de crecimiento estilo GitHub (`components/growth/GrowthCalendar.tsx`, 12 semanas, color según nº de Quick Wins completados ese día). Usa colores de marca (naranja) en vez de verde, para no salirse de la paleta naranja/negro/blanco del producto.
- [x] "Misión diaria" renombrada a "Quick Win #N" con numeración estable — guardada en `missions.sequence_number` (migración 0009), no calculada en el cliente. **Bug real encontrado y corregido:** la primera versión calculaba el número ordenando por `created_at`, pero las misiones se insertan en lote y pueden compartir el mismo timestamp exacto, así que el número cambiaba entre recargas. Se guarda una vez, al crear la misión.
- [x] Misión semanal con tratamiento visual de "boss" (👑, más grande, XP destacado en grande).
- [x] Marketplace renombrado a "Centro de Mejoras" en toda la UI + filtros por categoría (Todos/SEO/Google/Velocidad/Conversiones vía `lib/opportunities.ts` → `category`). La URL sigue siendo `/marketplace` a propósito — cambiarla habría exigido una redirección sin ganar nada real.
- [x] "Misiones de hoy" ahora solo muestra lo pendiente + lo completado hoy, no todo el historial acumulado. **Bug real encontrado de paso:** antes de este cambio, esa lista crecía sin límite para siempre (todas las misiones completadas desde el primer día seguían apareciendo ahí) — no se había notado porque las cuentas de prueba eran nuevas. El historial completo ahora vive en el calendario, no en esa lista.

**Gamificación nueva**
- [x] Cofre diario (`daily_chests`, migración 0010) — una apertura al día por negocio, recompensa real: XP (5-20) o un Quick Win extra desbloqueado. Sin descuentos ni "informe premium": esas cosas no existen todavía en el producto, así que no se ofrecen como recompensa.
- [x] Multiplicador ×2 de XP a partir del 3er Quick Win completado en el mismo día — regla determinista sobre datos reales (`missions.completed_at`), sin tabla nueva.
- [x] **Growth Replay** (`components/growth/GrowthReplay.tsx`) — antes/después real del Growth Score con las misiones completadas en medio, usando `growth_score_history`. Solo se muestra con 2+ puntos de historial; con menos, no aparece nada (nunca un "antes/después" inventado).

**Infraestructura** (migración 0011)
- [x] Feature flags (`feature_flags`, `lib/featureFlags.ts`) — sin panel de admin todavía, se editan por SQL directamente en Supabase. La base real está lista para cuando haga falta un panel.
- [x] Eventos de analytics (`analytics_events`, `lib/analytics.ts`) — enganchado en: `signup_completed`, `audit_started` (anónimo), `mission_completed`, `opportunity_requested`, `checkout_completed`. **No cubierto todavía:** clic en CTA y abandono (necesitan tracking desde el cliente, no solo desde el servidor) — se añaden cuando haya un caso de uso concreto para esos datos, no antes.
- [x] Notificaciones in-app (`notifications`, campana en `AppHeader`) — disparadas de verdad en hitos de racha (7/30 días) y subida del Growth Score. **No cubierto:** email ni push — Resend sigue sin conectar (bloqueante ya documentado desde el Sprint 1), y push no tiene sentido sin una app instalable todavía.
- [ ] **Cola de auditorías** — decidido NO construirla todavía. Es una decisión de arquitectura (qué proveedor de colas, cómo se reintenta, cómo se notifica cuando termina) que cambia cómo se despliega la app, no una feature aislada. Sin señales reales de que el análisis directo esté dando problemas de escala hoy, construir esto ahora sería trabajo especulativo. Se retoma si el tráfico real lo justifica.

**Identidad de marca**
- [x] Mascota v1 (`components/growth/Mascot.tsx`, SVG inline, sin dependencias) — usada en `ScoreCelebration` y como aviso de "hoy puedes subir de nivel". **Explícitamente una primera propuesta, no una decisión cerrada de marca** — nombre y diseño final los valida el fundador antes de extenderla a más sitios (emails, redes, etc).

**Pendiente, requiere IA (Sprint 4, sin empezar):** comparador de competidores ("te adelantó esta semana") y roadmap 90 días estilo Notion. Growth Sprint (renombrar "SEO Sprint" → "Crecimiento Local") no tiene nada que renombrar todavía porque esa función no existe — se nombrará bien desde el principio cuando se construya, no antes.

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
