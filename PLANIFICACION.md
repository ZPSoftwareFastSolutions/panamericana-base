# PLANIFICACIÓN — Sistema de Gestión "Panamericana"

> **Versión:** 0.5 · **Fecha:** 2026-09-15 · **Estado:** Sprint 1 en curso · repositorio del equipo montado y corregido · contexto Bolivia · todo en local
> **Entorno:** Proyecto aislado (cuarentena), sin dependencias ni contexto heredado.
>
> 📅 **Calendario vigente (desde v0.4):** Sprint 1 **08/09 → 19/09** · Sprint 2 **22/09 → 03/10** · Sprint 3 **06/10 → 17/10, sin confirmar por el docente**. Ya **no existe Sprint 0** ni los Sprints 4–6 de versiones anteriores.

### Historial de cambios

| Versión | Cambio |
|---|---|
| 0.1 | Propuesta inicial de roles, stack y arquitectura. |
| 0.2 | Ángel pasa a **Scrum Master + Backend**; Grisel pasa a **Backend + Frontend**. Stack simplificado para aprendizaje. Base de datos en **Supabase**. Flujo de aprobación de BD. Fechas de Sprint 0 y 1 confirmadas. |
| 0.3 | Repositorio construido: workspaces (`shared`, `backend`, `web`), módulo de ejemplo `buses` de punta a punta, Next.js 16. Móvil aplazado para priorizar la web. Modelo de datos v0.9 con tripulación, tramos, tarifas y ventas. |
| 0.4 | **Calendario comprimido a 3 sprints** (el docente fijó Sprint 1 del 08/09 al 19/09 y Sprint 2 del 22/09 al 03/10; el Sprint 3 está sin confirmar). Desaparece el Sprint 0: su guía pasa a ser la del Sprint 1. **Product Backlog del MVP** con épicas E0–E11 e historias de usuario. Despliegue en **Vercel + Supabase** (ADR-002, propuesta). Canal móvil como **PWA**. Nueva sección de **tecnologías emergentes**. |
| 0.5 | **Contexto Bolivia** (documentos `ci`/`ce`/`pasaporte`, placas, Bs). **Despliegue en la nube movido a la fase final**: todo corre en local hasta entonces. Tokens de Supabase firmados con **ECC P-256** (validación por JWKS). El repositorio del equipo lo administra **AngelParedesH20**. |

### Documentos del proyecto

| Documento | Propósito |
|---|---|
| `CLAUDE.md` | **Punto de entrada de cada sesión:** contexto, estado actual, próximos pasos y reglas. |
| `PLANIFICACION.md` | Este documento: roles, stack, reglas, calendario y roadmap. |
| `PRODUCT_BACKLOG.md` | **Épicas, historias de usuario, criterios de aceptación, tarjetas `PAN-xx` por sprint, carga por integrante y plan de contingencia.** Es la fuente de las tarjetas de Trello. |
| `ARQUITECTURA_CLEAN.md` | Guía de trabajo: puesta en marcha, mapa del repositorio, flujo completo y recetas paso a paso. |
| `PROPUESTA_BD.md` | Modelo de datos v1.0, creado en Supabase (nombres congelados). |
| `docs/adr/` | Decisiones: ADR-001 (concurrencia), ADR-002 (despliegue en la nube), ADR-003 (uso de Supabase). |
| `docs/guias-sprint/GUIA_SPRINT_NN.md` | Detalle técnico de las tarjetas de cada sprint. |
| `REPLICACION_REPO2.md` | Reglas de aislamiento y cómo se transfiere la base al repositorio del equipo. |
| `docs/repo2/` | README básico del repositorio del equipo y `CORRECCIONES_NN.md` (cambios puntuales que copia Ángel). |
| `docs/equipo/GUIA_DESARROLLO.md` | Guía de desarrollo para los 5 integrantes (se comparte por fuera del repositorio). |

---

## 1. Visión del Producto

Sistema web y móvil, pensado para **producción**, para la empresa de transporte **Panamericana**, que opera en **Bolivia (La Paz)**. Datos y reglas bolivianas: carnet de identidad (`ci`), placas `1234ABC`, montos en bolivianos y hora de La Paz.

| Dominio | Alcance |
|---|---|
| **Venta de pasajes** | Búsqueda de viajes, selección de asiento en tiempo real, compra, emisión y anulación. Canales: web, móvil y taquilla. |
| **Flota** | Buses, croquis de asientos y estado operativo. |
| **Rutas y viajes** | Terminales, rutas, programación de viajes y tarifas. |
| **Encomiendas** | Registro, costo, asignación a viaje, seguimiento y entrega. |
| **Administración** | Usuarios internos, roles de negocio y reportes. |

**Requisito crítico:** ningún asiento puede venderse dos veces para el mismo viaje, aunque haya compras simultáneas por web, móvil y taquilla.

**Alcance del MVP (3 sprints):** venta web por tramos con control de concurrencia, gestión operativa (terminales, buses, croquis, rutas, viajes y tarifas), taquilla, encomiendas, boleto con QR, panel de indicadores con **predicción de demanda** y canal móvil como **PWA**. La app nativa, la pasarela de pago real y la tripulación quedan fuera del compromiso. Detalle en `PRODUCT_BACKLOG.md`.

---

## 2. Equipo y Asignación de Roles

### 2.1 Distribución validada

| Integrante | Rol | Dedicación | Ownership (responsable de…) |
|---|---|---|---|
| **Ángel Fabricio Paredes Campos** | Scrum Master + Backend | 40 % SM · 60 % BE | **Proceso:** Scrum, Trello, pipeline de CI · **Backend Operaciones:** terminales, buses y asientos, rutas, viajes |
| **John Martín Zabaleta Cano** | Backend | 100 % BE | **Base del backend:** estructura, conexión a Supabase, migraciones · **Identidad:** autenticación y usuarios · **Comercial:** pasajes, concurrencia de asientos y pagos |
| **Grisel** | Backend + Frontend | 50 % BE · 50 % FE | **De punta a punta (API + pantallas):** clientes, encomiendas y reportes |
| **Brisa** | Frontend | 100 % FE | **Backoffice web:** layout y navegación, usuarios, terminales, buses y croquis, rutas, viajes, taquilla |
| **Karime** | Frontend | 100 % FE | **Canal cliente:** portal web público de compra + canal móvil (PWA en el MVP) |

### 2.2 Por qué esta distribución está balanceada

1. **Ángel desarrolla menos porque también es SM.** Solo tiene módulos operativos de tipo CRUD, sin la lógica más compleja. Encomiendas y reportes pasaron a Grisel, y la base del backend pasó a John. Conserva el pipeline de CI porque se relaciona con su rol de vigilar la calidad (Definition of Done).
2. **Grisel trabaja con "rebanadas verticales".** Construye cada módulo completo, API y pantallas, así que no depende de nadie para integrar. Es la mejor forma de aprender el flujo entero. Sus pantallas se insertan en el layout del backoffice de Brisa.
3. **John tiene la parte más compleja** (concurrencia y pagos). La base del backend ya quedó construida antes del Sprint 1 (11–12/09).
4. **Brisa tiene muchas pantallas en una sola plataforma**, y **Karime tiene un solo flujo de negocio en dos plataformas**.

### 2.3 Parejas de integración

```
John   (Comercial)       ⇄  Karime  (web pública + móvil)
John   (Comercial)       ⇄  Brisa   (taquilla)
Ángel  (Operaciones)     ⇄  Brisa   (backoffice operativo)
Grisel (API encomiendas) ⇄  Grisel  (pantallas encomiendas) → integra en layout de Brisa
```

### 2.4 Revisión de código (Pull Requests)

| Autor | Revisor principal | Revisor alterno |
|---|---|---|
| John (BE) | Grisel | Ángel |
| Ángel (BE) | John | Grisel |
| Grisel (BE) | John | Ángel |
| Grisel (FE) | Brisa | Karime |
| Brisa | Karime | Grisel |
| Karime | Brisa | Grisel |

> Revisar código ajeno también sirve para aprender: cada backend lee el código de los demás contextos.

### 2.5 Responsabilidades por rol

**Scrum Master + Backend — Ángel**
- Facilitar Planning, Daily, Review y Retrospectiva. Si falta, facilita John.
- Administrar Trello: WIP, etiquetas y trazabilidad Épica → Historia → Tarea.
- Coordinar la priorización con el Product Owner (representante de Panamericana o docente).
- Verificar el DoD antes de mover tarjetas a *Done*.
- Medir velocidad y burndown, y redistribuir si detecta sobrecarga.
- **Regla de "no ser juez y parte":** las tarjetas de desarrollo de Ángel las valida **John** antes de pasar a *Done*.

**Backend — John, Ángel, Grisel (50 %)**
- Declarar el endpoint y sus tipos en `shared/src/` **antes** de implementarlo. Es el contrato que ve el equipo (`docs/api/openapi.yaml` solo existe en este repositorio).
- Implementar dominio, casos de uso y adaptadores según `ARQUITECTURA_CLEAN.md`.
- Escribir migraciones SQL cumpliendo la sección 6.
- Escribir pruebas unitarias de dominio y casos de uso.

**Frontend — Brisa, Karime, Grisel (50 %)**
- Consumir la API solo desde la carpeta `servicios/` de cada módulo, nunca desde los componentes.
- Usar las direcciones de `shared/src/endpoints.ts`; nunca escribir una URL a mano.
- Manejar los estados de carga, error y conflicto (p. ej., "asiento ya tomado").

### 2.6 Reglas anti-sobrecarga

| Regla | Valor |
|---|---|
| WIP máximo *En Progreso* — Ángel (SM + BE) | **1 tarjeta de desarrollo** |
| WIP máximo *En Progreso* — Grisel (BE + FE) | **2 tarjetas** (máx. 1 BE + 1 FE) |
| WIP máximo *En Progreso* — John, Brisa, Karime | **2 tarjetas** |
| Tiempo máximo de una tarjeta en *Review* sin revisar | **24 h hábiles** |
| Capacidad comprometida por sprint | ≤ **80 %** de la velocidad promedio |
| Historia más grande permitida | **8 puntos** (si es mayor, se divide) |
| Diferencia de carga entre integrantes (ajustada a su dedicación) | ≤ **30 %** |

### 2.7 Capacidad por sprint (desde v0.4)

| Integrante | Puntos comprometidos por sprint (80 %) |
|---|---|
| John · Grisel · Brisa · Karime | **10** cada uno |
| Ángel (SM + BE) | **6** |
| **Total del equipo** | **46** |

Es una hipótesis inicial: se recalibra en la Review del Sprint 1 con la velocidad real. En los Sprints 2 y 3 hay ajustes temporales de *ownership* (Grisel apoya Operaciones en el Sprint 2; Ángel entrena el modelo de IA), justificados en `PRODUCT_BACKLOG.md`, sección 6.

---

## 3. Stack Tecnológico (simplificado para aprender)

**Principio:** usar la menor cantidad de herramientas posible para que el equipo **vea** la arquitectura en lugar de esconderla detrás de un framework. Las herramientas avanzadas se agregan cuando haya una necesidad real (ver `ARQUITECTURA_CLEAN.md`, sección 14).

| Capa | Tecnología | Por qué |
|---|---|---|
| **Repositorio** | Un repo con workspaces de npm: `shared/`, `backend/`, `web/`, más `supabase/` y `docs/` | Un solo `npm install` en la raíz; sin herramientas extra de monorepo |
| **Contrato API** | `shared/src/` (direcciones y tipos). `docs/api/openapi.yaml` queda como referencia interna de este repositorio | Backend y web leen la misma dirección; imposible desincronizarse |
| **Backend** | Node.js 24 LTS · TypeScript (`strict`) · Express 5 · Zod · puerto 4000 | Framework mínimo; la inyección de dependencias se hace a mano y se entiende |
| **Acceso a datos** | `pg` (node-postgres) con SQL escrito a mano | Control total del SQL en minúsculas y de los nombres de campos |
| **Base de datos** | **Supabase** (PostgreSQL gestionado) | Postgres real con transacciones, más panel, backups y autenticación |
| **Migraciones** | Supabase CLI → `supabase/migrations/*.sql` | Archivos SQL versionados en Git |
| **Autenticación** | Supabase Auth · la API valida el token con JWKS (firma ECC P-256) | No se implementan contraseñas ni tokens a mano |
| **Web** | Next.js 16 (App Router) · TanStack Query · Tailwind CSS · puerto 3000 | Estándar actual de React |
| **Móvil** | **PWA**: el portal web se instala en el celular (Sprint 3). App nativa fuera del MVP | Cumple el canal móvil sin duplicar el frontend |
| **IA / Machine learning** | Python + scikit-learn en un notebook (entrenamiento) · coeficientes en JSON usados por la API (Sprint 3) | La API no ejecuta Python; el modelo se reentrena fuera de línea |
| **Pruebas** | Vitest | Una sola herramienta para dominio y casos de uso |
| **CI** | GitHub Actions: lint + tests + build | Un pipeline sencillo |
| **Despliegue** | **Vercel** (web y API) + **Supabase** (datos y autenticación) — ADR-002 · **fase final** (fecha a definir); hasta entonces todo corre en local | Plataforma nativa de Next.js, plan gratuito, despliegue continuo desde `main` |

---

## 4. Arquitectura

La guía completa, con ejemplos, está en **`ARQUITECTURA_CLEAN.md`**. Resumen:

| Capa | Pregunta que responde | Dónde vive |
|---|---|---|
| **1. Dominio** | ¿Cuáles son las reglas del negocio? | `backend/src/modulos/<modulo>/dominio/` |
| **2. Casos de uso** | ¿Qué acción realiza el usuario y en qué pasos? | `backend/src/modulos/<modulo>/casos-de-uso/` |
| **3. Adaptadores de interfaz** | ¿Cómo entra la petición (HTTP) y cómo se guarda (SQL)? | `backend/src/modulos/<modulo>/adaptadores/` |
| **4. Infraestructura** | ¿Cómo arranca el servidor y cómo se conecta a Supabase? | `backend/src/infraestructura/` |

**Regla de oro:** las dependencias apuntan hacia adentro. El dominio no importa nada externo.

### 4.1 Decisión: cómo usamos Supabase (ADR-003)

| Regla | Detalle |
|---|---|
| **Datos siempre por la API** | Web y móvil **no** leen ni escriben tablas con `supabase-js`. Solo lo usan para iniciar sesión y obtener el token. |
| **RLS activado** | Row Level Security activo en todas las tablas de `public`, **sin políticas** para `anon` ni `authenticated`. Así la API automática de Supabase no expone datos. |
| **Conexión del backend** | Cadena de conexión Postgres (modo sesión) en variables de entorno. Nunca se sube al repositorio. |
| **Claves** | La `service_role key` y la contraseña de BD **jamás** van a web o móvil. |
| **Entornos** | Un proyecto Supabase de desarrollo y staging (`panamericana`), compartido por ambos repositorios. El proyecto de producción se crea antes de la entrega final; solo cambian las variables de entorno. |
| **Cambios de esquema** | Solo por migraciones. **Prohibido** crear o editar tablas desde el panel en staging/prod. |

---

## 5. Concurrencia de Asientos (ADR-001)

**Problema:** dos compradores eligen el mismo asiento del mismo viaje al mismo tiempo.

| # | Defensa | Qué hace |
|---|---|---|
| 1 | **Retención temporal** | Al iniciar la compra, el asiento queda *reservado* por unos minutos y los demás lo ven ocupado. |
| 2 | **Bloqueo en transacción** | Al confirmar, la transacción bloquea el registro con `select ... for update`, así las confirmaciones se atienden de una en una. |
| 3 | **Restricción de exclusión por tramo** | PostgreSQL rechaza un segundo pasaje activo del mismo asiento y viaje cuyo tramo se cruce con otro (`pasajes_asiento_sin_traslape`), aunque la aplicación falle. |

- El conflicto se convierte en el error de dominio `AsientoNoDisponibleError` y en una respuesta **HTTP 409** definida en el contrato.
- Funciona igual en Supabase porque es PostgreSQL real con transacciones.

---

## 6. Base de Datos: Flujo de Aprobación y Restricciones

### 6.1 Flujo de aprobación del modelo de datos

| Paso | Estado |
|---|---|
| Borrador v0.1 y revisión (tripulación, tramos, tarifas, ventas) | ✅ 11–12/09 |
| Modelo v1.0 aplicado en Supabase (16 tablas) y nombres **congelados** | ✅ 12/09 |
| Modelo **v2.0** normalizado hasta 5FN (26 tablas + 4 vistas) y nombres recongelados | ✅ 22/09 |
| Contexto Bolivia: migración `documentos_bolivia` | ✅ 15/09 |
| Proyecto de producción | ⏳ Fase final |

**Desde ahora, un cambio al modelo** es una migración nueva (nunca editar las aplicadas), se refleja en `PROPUESTA_BD.md` y, si afecta al equipo, se registra en `docs/repo2/CORRECCIONES_NN.md`.

### 6.2 Restricciones obligatorias

| # | Regla |
|---|---|
| **R1** | **Todas las palabras reservadas SQL en minúsculas**: `create table`, `select`, `insert into`, `not null`, `primary key`, `references`, `unique`, etc. |
| **R2** | Los nombres de tablas y campos son **exactamente** los de la versión aprobada del modelo de datos. Se usan **idénticos** en la BD, las entidades, los DTOs y el JSON de la API (p. ej. `numero_pisos` en todas partes). |
| **R3** | Una vez aprobado, **ningún campo se renombra** en migraciones posteriores. |
| **R4** | Sin ORM ni alias de columnas: SQL escrito a mano con `pg`. |
| **R5** | Migraciones con Supabase CLI: versionadas, revisadas en PR y **solo hacia adelante** en producción. |
| **R6** | Los mappers solo convierten **tipos** (p. ej. `numeric` → `number`), nunca nombres. |
| **R7** | El checklist del PR verifica R1–R6. La verificación automática (sqlfluff) queda como *Could* (HU-031, épica E10). |

---

## 7. Marco de Trabajo Scrum

### 7.1 Calendario

> **Fijado por el docente (v0.4).** Reemplaza el calendario anterior de 7 sprints (Sprint 0 a Sprint 6), que queda **anulado**.

| Sprint | Fechas | Estado | Incremento |
|---|---|---|---|
| **Sprint 1** — Base operativa | **08/09/2026 → 19/09/2026** | 🔄 En curso · confirmado | Equipo en local sobre la misma base, catálogos iniciales y maqueta del portal |
| **Sprint 2** — MVP 1 | **22/09/2026 → 03/10/2026** | ✅ Confirmado | Venta web por tramos con control de concurrencia (en local) |
| **Sprint 3** — MVP 2 | *06/10/2026 → 17/10/2026* | ⚠️ **Sin confirmar** (fechas tentativas) | Taquilla, encomiendas, boleto QR, panel con predicción de demanda y PWA |
| **Fase final** — Nube | *Fecha a definir* | ⏳ Pendiente | Despliegue en Vercel + Supabase (PAN-09, PAN-24). Obligatoria: sostiene *cloud computing* |

- Los sprints van de **martes a sábado de la semana siguiente**, según las fechas del docente.
- Cada incremento se puede demostrar por sí solo. Si el Sprint 3 no se confirma o se acorta, se aplica el plan de contingencia de `PRODUCT_BACKLOG.md`, sección 7.
- La guía del Sprint 1 es `docs/guias-sprint/GUIA_SPRINT_01.md` (antes `GUIA_SPRINT_00.md`).

### 7.2 Ceremonias

| Ceremonia | Cuándo | Duración | Facilita |
|---|---|---|---|
| Sprint Planning | Primer día del sprint (martes) | ≤ 2 h | Ángel |
| Daily | Diario (presencial, virtual o asíncrono en Trello) | 15 min | Ángel |
| Refinamiento | Mitad de sprint | 1 h | Ángel |
| Sprint Review | Último día del sprint (sábado) | 1 h | Ángel |
| Retrospectiva | Último día del sprint (sábado) | 45 min | Ángel |

### 7.3 Flujo del tablero

`Por Hacer` → `En Progreso` → `Testing` → `Completao` *(nombres elegidos por el equipo en Trello)*

- **En Progreso:** hay trabajo en la rama `dev/<integrante>` y, si ya existe, un PR en borrador enlazado a la tarjeta.
- **Testing:** el PR está abierto, CI en verde y con revisor asignado (tabla 2.4), que prueba en local.
- **Done:** PR fusionado, probado en local por el revisor y DoD verificado. El despliegue en staging se exige desde la fase final.

### 7.4 Definition of Ready (DoR)

- [ ] Historia en formato *Como… quiero… para…*
- [ ] Criterios de aceptación verificables
- [ ] Estimada (Fibonacci: 1, 2, 3, 5, 8)
- [ ] Endpoint identificado en el contrato (si toca la API)
- [ ] Tablas y campos existentes en el modelo aprobado (si toca la BD)
- [ ] Responsable asignado sin exceder su WIP

### 7.5 Definition of Done (DoD)

- [ ] Código en la capa correcta (checklist de `ARQUITECTURA_CLEAN.md`)
- [ ] Pruebas de dominio y casos de uso pasan
- [ ] API conforme a las rutas y tipos de `shared/src/`
- [ ] SQL en minúsculas y nombres idénticos al modelo aprobado (R1–R6)
- [ ] PR aprobado por el revisor
- [ ] Criterios de aceptación validados en local (en staging desde la fase final)

### 7.6 Convenciones Git

| Elemento | Convención |
|---|---|
| Estrategia | Una rama por integrante con un PR hacia `main` por cada tarjeta; traer `main` a la rama todos los días |
| Ramas | `dev/angel` · `dev/john` · `dev/grisel` · `dev/brisa` · `dev/karime` (`REPLICACION_REPO2.md`, sección 7) |
| Commits | Conventional Commits: `feat:`, `fix:`, `contract:`, `db:`, `test:`, `docs:` |
| `main` protegida | PR obligatorio, CI en verde y 1 aprobación |
| Trazabilidad | ID de tarjeta en el commit (`feat(PAN-03): ...`) y en el título del PR |

---

## 8. Roadmap de Épicas (MVP en 3 sprints)

Las historias de usuario, los criterios de aceptación y las tarjetas están en **`PRODUCT_BACKLOG.md`**. Este es el resumen:

| Épica | Nombre | Backend | Frontend | Sprint | Prioridad |
|---|---|---|---|---|---|
| **E0** | Fundaciones y plataforma en la nube (repositorio, CI; despliegue Vercel + Supabase en la fase final) | John · Ángel | Todos (entorno) | 1 + fase final | Must |
| **E1** | Identidad y acceso (usuarios, login, roles) | John | Brisa | 1–2 | Must |
| **E2** | Clientes | Grisel | Grisel | 1 | Must |
| **E3** | Terminales, flota y croquis de asientos | Ángel · Grisel | Brisa | 1–3 | Must |
| **E4** | Rutas, viajes y tarifas | Ángel · Grisel | Brisa · Karime | 2–3 | Must |
| **E5** | Venta web con control de concurrencia | John · Grisel | Karime | 1–3 | Must |
| **E6** | Encomiendas | Grisel | Grisel | 3 | Should |
| **E7** | Taquilla (venta presencial) | John | Brisa | 3 | Must |
| **E8** | Canal móvil (PWA; app nativa fuera del MVP) | — | Karime | 3 | Should |
| **E9** | Control, comprobantes y reportes (boleto QR, panel) | Grisel · John | Brisa · Karime | 3 | Should |
| **E10** | Calidad y endurecimiento | Todos | Karime | 3 | Must |
| **E11** | Inteligencia artificial (predicción de demanda; chatbot opcional) | Ángel · John | Brisa | 3 | Must |

> **Módulo de referencia:** `buses` quedó implementado de punta a punta el 11–12/09, antes del Sprint 1. Sirve de plantilla para todos los demás.

---

## 9. Tecnologías Emergentes

**Requisito de la asignatura:** *considerar la incorporación de una tecnología emergente* (cloud computing, big data o machine learning). Basta con **una**; el proyecto incorpora **dos**, y las dos son **importantes para la defensa**.

| Tecnología | Estado | Cómo se incorpora | Dónde está en el backlog |
|---|---|---|---|
| **Cloud computing** | ⏳ **Cumple al desplegar** (fase final, obligatoria) | Vercel (PaaS/serverless: web y API con despliegue continuo, CDN y escalado automático) + Supabase (DBaaS con PostgreSQL gestionado, autenticación como servicio y respaldos) | E0 · HU-004 · ADR-002 |
| **Machine learning** | ✅ **Cumple con la predicción de demanda** (Sprint 3; ver contingencia 7.1 del backlog) | Modelo supervisado de regresión lineal múltiple entrenado con el historial de ventas, validado con MAE, RMSE y R², y consumido por la API para sugerir buses de refuerzo | E11 · HU-033 |
| **Big data** | ❌ No se incorpora | El volumen, la velocidad y la variedad de datos de una operadora de buses no justifican herramientas de big data. **No se debe declarar** en el documento | — |

### 9.1 ¿Alojar en Vercel cuenta como cloud computing?

**Sí**, siempre que se documente como arquitectura en la nube y no como "un hosting":

- Vercel es una **plataforma como servicio (PaaS) serverless**: la API corre como funciones que escalan solas y la web se distribuye por CDN.
- Supabase es **base de datos como servicio (DBaaS)** con autenticación gestionada.
- Juntas cumplen las cinco características del NIST SP 800-145 (autoservicio bajo demanda, acceso amplio por red, recursos compartidos, elasticidad y servicio medido). La tabla de evidencia está en ADR-002.

### 9.2 ¿Un chatbot de respuestas cubre machine learning?

**Solo en parte, y no reemplaza a la predicción de demanda:**

| Tipo de chatbot | ¿Es machine learning? |
|---|---|
| Por reglas o menú de preguntas fijas | ❌ No. Es lógica condicional |
| Con un modelo de lenguaje por API (IA generativa) | ⚠️ Usa un modelo de ML ya entrenado por terceros, pero el equipo **no entrena ni evalúa nada**. Un tribunal exigente puede considerarlo "consumo de un servicio" |
| **Predicción de demanda con regresión** | ✅ **Sí.** El equipo prepara datos, entrena, mide el error e integra el modelo. **Además está en el título del proyecto** |

**Decisión:** la predicción de demanda (HU-033) es **Must**. El chatbot (HU-034) es **Could**: suma como complemento si sobra capacidad, pero sin la predicción el título quedaría sin respaldo.

---

## 10. Riesgos

| Riesgo | Prob. | Impacto | Mitigación | Responsable |
|---|---|---|---|---|
| El Sprint 3 no se confirma o se acorta | Media | Alto | Incrementos demostrables por sprint; plan de contingencia (`PRODUCT_BACKLOG.md`, sección 7) | Ángel |
| Calendario comprimido (de 7 a 3 sprints) | Alta | Alto | MVP priorizado con MoSCoW; capacidad ≤ 80 %; lo *Could* fuera del compromiso | Ángel |
| La API Express no funciona como función serverless en Vercel | Media | Medio | Spike PAN-09 en el Sprint 1; plan B: API en Render o Railway (sigue siendo nube) | John |
| Conexiones agotadas desde funciones serverless | Media | Medio | Transaction pooler de Supabase y pool pequeño (ADR-002) | John |
| Dataset de demanda sintético cuestionado en la defensa | Media | Medio | Declararlo como sintético, documentar cómo se generó y reentrenar con ventas reales | Ángel |
| Doble venta de asientos | Media | Crítico | ADR-001 (tres defensas) + prueba concurrente | John |
| Curva de aprendizaje de Clean Architecture | Alta | Alto | Guía sencilla, módulo de referencia `buses`, revisión cruzada | John + Ángel |
| Frontend bloqueado esperando la API | Alta | Alto | PR de contrato (`shared/src`) el primer día + pantallas que muestran el estado de error sin romperse | Ángel (vigila) |
| Vercel (plan gratuito) bloquea despliegues de commits de colaboradores en el repositorio privado | Alta | Medio | Proyectos de Vercel en la cuenta del dueño del repositorio (Ángel), que es quien fusiona a `main` (ADR-002) | Ángel + John |
| Conflictos en archivos compartidos (`shared/src/endpoints.ts`, `index.ts`, `rutas.ts`, `contenedor.ts`, menú) con 5 ramas abiertas | Alta | Medio | PR de contrato pequeño y fusionado primero; cada integrante agrega solo sus líneas | Ángel |
| Sprint 1 con 4 días hábiles restantes al crear el tablero (15/09) | Alta | Medio | Contingencia 7.3 del backlog: lo no terminado abre el Sprint 2 | Ángel |
| Despliegue concentrado al final: problemas de la nube descubiertos tarde | Media | Alto | Checklist de ADR-002 listo de antemano; agendar la fase final en la Review del Sprint 2, no después | John + Ángel |
| Modelo de datos cambiante tras aprobación | Media | Alto | Ronda de comentarios antes de congelar (6.1) | Ángel |
| Exposición de datos por la API automática de Supabase | Media | Crítico | RLS sin políticas públicas + claves solo en backend (4.1) | John |
| SM con poco tiempo para desarrollar | Media | Medio | 40 % SM, WIP 1, módulos CRUD | Ángel |
| Sobrecarga de un integrante | Media | Medio | Reglas 2.6 revisadas en cada Planning | Ángel |
| Semanas de exámenes | Alta | Medio | Capacidad ≤ 80 %, ajustar el sprint afectado | Ángel |

---

## 11. Pendientes para la Siguiente Iteración

| # | Pendiente | Estado |
|---|---|---|
| 1 | Validar roles | ✅ Hecho (v0.2) |
| 2 | Correos o usuarios de Trello de los 5 integrantes | ✅ Recibidos. Tablero creado con el Sprint 1 el 15/09: https://trello.com/b/ida3R2kt/panamericana · ⏳ invitar al equipo desde Trello (la integración no envía invitaciones) |
| 3 | Espacio de trabajo de Trello | ✅ Cualquiera |
| 4 | Fechas de los sprints | ✅ Sprint 1 y 2 fijados por el docente · ⏳ **Sprint 3 sin confirmar** |
| 5 | Modelo de datos v2.0 | ✅ Creado en Supabase (26 tablas + 4 vistas, normalizado hasta 5FN) |
| 6 | Despliegue (ADR-002) | ⏳ **Fase final** (fecha a definir). Hasta entonces, todo en local |
| 7 | Product Backlog del MVP | ✅ `PRODUCT_BACKLOG.md` v1.0 |
| 8 | Guía y tarjetas de Trello del Sprint 2 (PAN-10 a PAN-23) | ⏳ Solo cuando el usuario lo pida, antes del Planning del 22/09 |
| 9 | Documento de identidad boliviano (`ci`) en `clientes.tipo_documento` (P12) | ✅ Migración `documentos_bolivia` aplicada (15/09) |
| 10 | Validación del plan v0.4 (15/09) | ✅ Sin rupturas de arquitectura; ajustes aplicados en este documento, `PRODUCT_BACKLOG.md`, ADR-002, ADR-003 y `GUIA_SPRINT_01.md` |
| 11 | Autoría del repositorio del equipo: sin rastros de la cuenta Z&P, administrado por **AngelParedesH20** | ✅ Aplicado por Ángel (15/09) · `docs/repo2/CORRECCIONES_01.md` |
| 12 | Copiar al repositorio del equipo los archivos ajustados para Bolivia | ✅ Aplicado por Ángel (15/09) |
| 13 | Invitar al equipo al tablero de Trello (hoy solo figura la cuenta conectada) | ⏳ Desde la interfaz de Trello; falta el correo de Ángel |
| 14 | PAN-02: colaboradores, protección de `main` y ramas `dev/*` en el repositorio del equipo | ⏳ Ángel |
| 15 | Fecha de la fase final de despliegue | ⏳ Se agenda en la Review del Sprint 2 (03/10) |
