# GrowthOS — Decisiones técnicas

Registro de decisiones de arquitectura. Cada entrada: **decisión**, **alternativas consideradas**, **por qué**.

## 2026-08-20 — Registro opcional: se ve un resultado real antes de pedir cuenta

**Decisión:** la landing ya no redirige directo a `/signup` al introducir un dominio. Ahora pasa por `/analisis`, una página pública (sin sesión) que ejecuta un análisis rápido real (`lib/quickAudit.ts`): SSL, título, meta descripción, H1 y viewport móvil, con petición `fetch` server-side directa al dominio introducido. Solo se pide cuenta cuando el usuario quiere guardar el resultado y ver sus misiones.

**Por qué:** feedback directo del fundador tras probar el Sprint 1 — forzar registro antes de mostrar cualquier valor generaba fricción y "echaba para atrás". Encaja además con la especificación original del producto ("Después de analizar → Crear cuenta"). La alternativa de "modo invitado completo" (usar todo el dashboard sin cuenta) se descartó por ahora por complejidad added (persistencia sin usuario, fusión de datos al registrarse después).

**Nota de seguridad:** al ser un endpoint público que hace `fetch` a una URL controlada por el usuario, se añadió protección SSRF en `lib/quickAudit.ts` — resuelve el DNS del dominio antes de conectar y rechaza rangos de IP privados/loopback/link-local (incluye el caso de metadata de cloud, 169.254.169.254).

## 2026-08-17 — Stack base

**Decisión:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth + Postgres) + Stripe + Resend + Vercel + Claude/OpenAI API + Framer Motion.

**Por qué:** Elegido por el fundador. Full-stack en un solo framework/repo, Postgres gestionado con Auth y RLS incluidos (Supabase), deploy sin DevOps en Vercel. Óptimo para iterar rápido hasta miles de usuarios sin reescritura de infraestructura.

## 2026-08-17 — Modelo de datos: single-tenant por negocio

**Decisión:** una cuenta (`auth.users` / `profiles`) = un negocio (`businesses`), relación 1:1 en el MVP.

**Alternativas consideradas:** multi-tenant (una cuenta gestiona varios negocios), pensado para agencias.

**Por qué:** el público objetivo confirmado son PYMEs con un único negocio, no agencias. Empezar 1:1 simplifica permisos y UI. La tabla `businesses` queda separada de `profiles` (no fusionada) para poder pasar a 1:N sin migración destructiva si el producto pivota a agencias más adelante.

## 2026-08-17 — Reordenar Supabase del Sprint 3 al Sprint 1

**Decisión:** mover setup de Supabase Auth + esquema base (profiles, businesses, missions) al Sprint 1, en vez de Sprint 3 como estaba planteado originalmente.

**Por qué:** el Sprint 1 incluye "Registro" de usuarios. Un registro sin persistencia real sería una demo, y el requisito explícito del proyecto es "no quiero una demo, quiero un MVP real". El Sprint 3 mantiene su alcance original: motor de auditoría automática, integración de IA para explicaciones, y emails transaccionales (Resend) — piezas que si dependen de más superficie y no bloquean sprints anteriores.

## 2026-08-17 — Growth Score y misiones diarias "estáticas" en Sprint 1 son datos reales, no mock

**Decisión:** en Sprint 1, el Growth Score y las misiones diarias se seedean como filas reales en Postgres (contenido fijo/editorial, no generado por IA todavía), no como datos hardcodeados en el frontend.

**Por qué:** así completar una misión persiste de verdad (marca `completed_at`, suma XP más adelante) desde el primer sprint, evitando reescribir la capa de datos cuando llegue el motor de auditoría en el Sprint 3.

## 2026-08-17 — Pinnar Next.js a v15, no v16

**Decisión:** `create-next-app@latest` instaló Next.js 16.3.1 por defecto; se fijó explícitamente a `next@15` (resuelto a `^15.5.23`) + `react@19` + `eslint-config-next@15`.

**Por qué:** Next 16 introduce cambios que rompen compatibilidad con el conocimiento de referencia usado para escribir código (el propio scaffold de Next 16 generaba un aviso interno de "APIs pueden diferir de tu entrenamiento, lee los docs antes de escribir código"). El fundador pidió explícitamente Next.js 15. Para minimizar riesgo de bugs por asunciones incorrectas de API en un MVP construido con asistencia de IA, se prioriza estabilidad y precisión sobre estar en la última versión.

**Riesgo aceptado:** `npm audit` reporta 3 vulnerabilidades "high" (PostCSS XSS/path traversal vía sourceMappingURL, y CVEs de libvips en `sharp`) cuyo único fix es subir a Next 16. Vectores de explotación requieren CSS no controlado por nosotros o procesamiento de imágenes subidas por usuarios (aún no implementado). **Revisar este riesgo antes de: (a) implementar subida de fotos por usuarios, (b) lanzar a producción.**

## 2026-08-17 — Email de confirmación de Supabase (built-in) no sirve para producción

**Hallazgo:** al probar el registro real en producción (`https://growth-os-smoky-eta.vercel.app`), Supabase devolvió `email rate limit exceeded` en el segundo intento. El servicio de email por defecto de Supabase (SMTP compartido) está limitado a unos pocos envíos por hora — pensado solo para desarrollo/pruebas, no para usuarios reales.

**Por qué importa:** con el límite por defecto, cualquier pico de registros (ej. una campaña de lanzamiento) rompería el alta de nuevos usuarios.

**Decisión:** aceptar la limitación durante el Sprint 1 (uso interno/pruebas). **Antes de abrir el registro al público**, configurar Resend como proveedor SMTP personalizado en Supabase (Authentication → Settings → SMTP Settings) — Resend ya está planeado en el stack para los Growth Reports semanales (Sprint 3), así que resolver esto junto con esa integración evita configurar dos proveedores de email distintos.
