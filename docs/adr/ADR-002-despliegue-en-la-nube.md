# ADR-002 — Despliegue en la nube (Vercel + Supabase)

- **Fecha:** 2026-09-15
- **Estado:** Propuesta · **se ejecuta en la fase final** del proyecto (fecha a definir, decisión del 15/09). Hasta entonces cada integrante trabaja en local contra la base compartida
- **Responsable:** John Zabaleta

## Contexto

- El MVP debe poder demostrarse en una URL pública, sin instalar nada, al final de cada sprint.
- El proyecto debe incorporar una **tecnología emergente**; el equipo eligió **cloud computing** (ver `PLANIFICACION.md`, sección 9).
- El sistema tiene tres piezas: web Next.js (`web/`), API Express (`backend/`) y base de datos PostgreSQL con autenticación en Supabase (ya creada, ADR-003).
- Presupuesto cero: se usan planes gratuitos.

## Decisión

| Pieza | Servicio | Modelo de servicio | Configuración |
|---|---|---|---|
| Web (`web/`) | **Vercel** — proyecto 1, directorio raíz `web` | PaaS con CDN global | Next.js detectado automáticamente |
| API (`backend/`) | **Vercel** — proyecto 2, directorio raíz `backend` | PaaS *serverless* (Vercel Functions) | Express 5 como función; región `iad1` (Washington), cerca de Supabase `us-east-1` |
| Base de datos y autenticación | **Supabase** (ya existe) | DBaaS + autenticación como servicio | Sin cambios |
| Código fuente | GitHub — Repositorio 2 (`panamericana`) | SaaS | `main` = producción de staging; cada PR genera una vista previa |

### Variables de entorno

Se cargan en el panel de Vercel, por entorno, y **nunca** en el repositorio:

| Proyecto | Variables |
|---|---|
| API | `DATABASE_URL`, `SUPABASE_URL`, `ALLOWED_ORIGINS` (dominio de la web en Vercel), `MINUTOS_RESERVA_ASIENTO`, `DB_POOL_MAX` |
| Web | `NEXT_PUBLIC_API_URL` (URL de la API en Vercel) |

### Conexión a la base desde funciones *serverless*

En desarrollo local se sigue usando el **Session pooler** (puerto 5432), como indica ADR-003. En Vercel, cada función puede abrir su propia conexión, y el modo sesión se queda sin conexiones con pocas instancias. Por eso, **en el entorno de Vercel**:

- `DATABASE_URL` usa el **Transaction pooler** de Supabase (mismo host, puerto **6543**).
- El pool de `pg` se limita a pocas conexiones por instancia.
- Las transacciones de ADR-001 (`begin` → `select ... for update` → `commit`) **siguen funcionando**, porque el pooler en modo transacción mantiene la conexión durante toda la transacción.
- No se usan funciones de sesión (`set` de sesión, `listen/notify`, sentencias preparadas con nombre).

### Liberación de reservas vencidas

Se hace **al consultar disponibilidad y al reservar** (Product Backlog, decisión de alcance), no con una tarea programada, para no depender de los límites de *cron* del plan gratuito.

## Qué valida el spike PAN-09

| # | Verificación | Si falla |
|---|---|---|
| 1 | La API Express responde `/salud` y `/v1/buses` desde Vercel | Alternativa para la API: **Render** o **Railway** (también PaaS en la nube); la web sigue en Vercel |
| 2 | Los workspaces de npm (`shared`) compilan en el build de Vercel | Ajustar el comando de build del proyecto |
| 3 | La API conecta a Supabase con el Transaction pooler y ejecuta una transacción | Revisar el tamaño del pool y la cadena |
| 4 | La web en Vercel consume la API sin errores de CORS | Ajustar `ALLOWED_ORIGINS` |
| 5 | Vercel despliega los commits de `main` del repositorio privado aunque el autor sea un colaborador | En el plan gratuito puede haber restricciones con colaboradores en repositorios privados. Mitigación: que fusione a `main` la cuenta dueña del proyecto de Vercel |
| 6 | Limitaciones del plan gratuito (duración de funciones, uso no comercial) | Documentarlas en esta ADR |

## Hallazgos de la validación del plan (15/09)

| # | Hallazgo | Acción |
|---|---|---|
| 1 | `shared` se consume compilado (`dist/`, ignorado por git). En Vercel no existe hasta compilarlo | Build de la web: `cd .. && npm run build:shared && npm run build --workspace web`. Build de la API: `cd .. && npm run build:shared && npm run build --workspace backend` |
| 2 | `infraestructura/baseDeDatos.ts` fija `max: 10` conexiones; con funciones *serverless* y el Transaction pooler conviene un pool pequeño | Agregar `DB_POOL_MAX` en `config.ts` (por defecto 10 en local, 3 en Vercel) como parte de PAN-09 |
| 3 | En el plan Hobby de Vercel, los despliegues de repositorios privados pueden bloquearse cuando el autor del commit no es el dueño de la cuenta | Proyectos de Vercel en la cuenta de **Ángel** (dueño del repositorio del equipo), que es quien fusiona a `main`. Las vistas previas de PR de colaboradores pueden no generarse |
| 4 | La identidad global de git de la computadora donde se montó el repositorio es la de Z&P (`ZPSoftwareFastSolutions`), así que el primer commit del repositorio del equipo probablemente quedó con esa autoría | Configurar `git config user.name` y `user.email` locales en el repositorio del equipo (checklist de PAN-02). Afecta también al hallazgo 3 |
| 5 | `main.ts` llama a `app.listen`, pero Vercel necesita la app exportada | Reutilizar `crearServidor()` desde un punto de entrada que exporte la app; `main.ts` sigue igual para local. No rompe capas: todo vive en infraestructura |

## Por qué cuenta como *cloud computing*

La definición del NIST (SP 800-145) pide cinco características. Esta arquitectura las cumple:

| Característica (NIST) | Cómo se cumple |
|---|---|
| Autoservicio bajo demanda | El equipo crea proyectos, bases y despliegues desde un panel, sin intervención del proveedor |
| Acceso amplio por red | Web y API accesibles por HTTPS desde cualquier dispositivo |
| Recursos compartidos (*pooling*) | Funciones *serverless* e infraestructura multiinquilino de Vercel y Supabase |
| Elasticidad rápida | Vercel crea o destruye instancias de la API según las peticiones |
| Servicio medido | Ambos proveedores miden y limitan el uso (invocaciones, ancho de banda, almacenamiento) |

Se usan tres modelos de servicio: **PaaS/serverless** (Vercel), **DBaaS/BaaS** (Supabase) y **SaaS** (GitHub).

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Servidor propio o VPS | Exige administrar sistema operativo, certificados y seguridad; no aporta al aprendizaje del equipo |
| Render o Railway para todo | Válidas, pero Vercel es la plataforma nativa de Next.js; quedan como plan B solo para la API |
| Supabase Edge Functions en lugar de Express | Rompe la regla de ADR-003: "Supabase no es el backend" |

## Consecuencias

- `backend/src/main.ts` necesita exportar la app de Express para Vercel sin romper `npm run dev:backend` en local (lo resuelve el spike).
- Las funciones *serverless* tienen **arranque en frío**: la primera petición después de un rato sin uso tarda más. Es aceptable para un MVP.
- Cuando se cree el proyecto de producción de Supabase (ADR-003), solo cambian las variables de entorno.
- **Regla del Repositorio 2:** la configuración de despliegue (por ejemplo, `vercel.json`) no debe mencionar documentos internos.
