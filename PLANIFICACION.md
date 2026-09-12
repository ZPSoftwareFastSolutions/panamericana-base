# PLANIFICACIÓN — Sistema de Gestión "Panamericana"

> **Versión:** 0.3 · **Fecha:** 2026-09-12 · **Estado:** Base del repositorio construida
> **Entorno:** Proyecto aislado (cuarentena), sin dependencias ni contexto heredado.

### Historial de cambios

| Versión | Cambio |
|---|---|
| 0.1 | Propuesta inicial de roles, stack y arquitectura. |
| 0.2 | Ángel pasa a **Scrum Master + Backend**; Grisel pasa a **Backend + Frontend**. Stack simplificado para aprendizaje. Base de datos en **Supabase**. Flujo de aprobación de BD. Fechas de Sprint 0 y 1 confirmadas. |
| 0.3 | Repositorio construido: workspaces (`shared`, `backend`, `web`), módulo de ejemplo `buses` de punta a punta, Next.js 16. Móvil aplazado para priorizar la web. Modelo de datos v0.9 con tripulación, tramos, tarifas y ventas. |

### Documentos del proyecto

| Documento | Propósito |
|---|---|
| `PLANIFICACION.md` | Este documento: roles, stack, reglas y roadmap. |
| `ARQUITECTURA_CLEAN.md` | Guía de trabajo: puesta en marcha, mapa del repositorio, flujo completo y recetas paso a paso. |
| `PROPUESTA_BD.md` | Modelo de datos v0.9 (candidata a v1.0), en última ronda de comentarios. |
| `TRELLO_SETUP.md` | *(Siguiente iteración)* Backlog y Sprint 1 en Trello. |

---

## 1. Visión del Producto

Sistema web y móvil, en entorno de **producción**, para la empresa de transporte **Panamericana**.

| Dominio | Alcance |
|---|---|
| **Venta de pasajes** | Búsqueda de viajes, selección de asiento en tiempo real, compra, emisión y anulación. Canales: web, móvil y taquilla. |
| **Flota** | Buses, croquis de asientos y estado operativo. |
| **Rutas y viajes** | Terminales, rutas, programación de viajes y tarifas. |
| **Encomiendas** | Registro, costo, asignación a viaje, seguimiento y entrega. |
| **Administración** | Usuarios internos, roles de negocio y reportes. |

**Requisito crítico:** ningún asiento puede venderse dos veces para el mismo viaje, aunque haya compras simultáneas por web, móvil y taquilla.

---

## 2. Equipo y Asignación de Roles

### 2.1 Distribución validada

| Integrante | Rol | Dedicación | Ownership (responsable de…) |
|---|---|---|---|
| **Ángel Fabricio Paredes Campos** | Scrum Master + Backend | 40 % SM · 60 % BE | **Proceso:** Scrum, Trello, pipeline de CI · **Backend Operaciones:** terminales, buses y asientos, rutas, viajes |
| **John Martín Zabaleta Cano** | Backend | 100 % BE | **Base del backend:** estructura, conexión a Supabase, migraciones · **Identidad:** autenticación y usuarios · **Comercial:** pasajes, concurrencia de asientos y pagos |
| **Grisel** | Backend + Frontend | 50 % BE · 50 % FE | **De punta a punta (API + pantallas):** clientes, encomiendas y reportes |
| **Brisa** | Frontend | 100 % FE | **Backoffice web:** layout y navegación, usuarios, terminales, buses y croquis, rutas, viajes, taquilla |
| **Karime** | Frontend | 100 % FE | **Canal cliente:** portal web público de compra + app móvil |

### 2.2 Por qué esta distribución está balanceada

1. **Ángel desarrolla menos porque también es SM.** Solo tiene módulos operativos de tipo CRUD, sin la lógica más compleja. Encomiendas y reportes pasaron a Grisel, y la base del backend pasó a John. Conserva el pipeline de CI porque se relaciona con su rol de vigilar la calidad (Definition of Done).
2. **Grisel trabaja con "rebanadas verticales".** Construye cada módulo completo, API y pantallas, así que no depende de nadie para integrar. Es la mejor forma de aprender el flujo entero. Sus pantallas se insertan en el layout del backoffice de Brisa.
3. **John tiene la parte más compleja** (concurrencia y pagos). La base del backend solo pesa en el Sprint 0, y ahí trabaja en pareja con Grisel.
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
- Escribir el endpoint en el contrato OpenAPI **antes** de implementarlo.
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
| WIP máximo *In Progress* — Ángel (SM + BE) | **1 tarjeta de desarrollo** |
| WIP máximo *In Progress* — Grisel (BE + FE) | **2 tarjetas** (máx. 1 BE + 1 FE) |
| WIP máximo *In Progress* — John, Brisa, Karime | **2 tarjetas** |
| Tiempo máximo de una tarjeta en *Review* sin revisar | **24 h hábiles** |
| Capacidad comprometida por sprint | ≤ **80 %** de la velocidad promedio |
| Historia más grande permitida | **8 puntos** (si es mayor, se divide) |
| Diferencia de carga entre integrantes (ajustada a su dedicación) | ≤ **30 %** |

---

## 3. Stack Tecnológico (simplificado para aprender)

**Principio:** usar la menor cantidad de herramientas posible para que el equipo **vea** la arquitectura en lugar de esconderla detrás de un framework. Las herramientas avanzadas se agregan cuando haya una necesidad real (ver `ARQUITECTURA_CLEAN.md`, sección 12).

| Capa | Tecnología | Por qué |
|---|---|---|
| **Repositorio** | Un repo con workspaces de npm: `shared/`, `backend/`, `web/`, más `supabase/` y `docs/` | Un solo `npm install` en la raíz; sin herramientas extra de monorepo |
| **Contrato API** | `shared/src/endpoints.ts` (direcciones y tipos) + `docs/api/openapi.yaml` | Backend y web leen la misma dirección; imposible desincronizarse |
| **Backend** | Node.js 24 LTS · TypeScript (`strict`) · Express 5 · Zod · puerto 4000 | Framework mínimo; la inyección de dependencias se hace a mano y se entiende |
| **Acceso a datos** | `pg` (node-postgres) con SQL escrito a mano | Control total del SQL en minúsculas y de los nombres de campos |
| **Base de datos** | **Supabase** (PostgreSQL gestionado) | Postgres real con transacciones, más panel, backups y autenticación |
| **Migraciones** | Supabase CLI → `supabase/migrations/*.sql` | Archivos SQL versionados en Git |
| **Autenticación** | Supabase Auth · la API valida el JWT | No se implementan contraseñas ni tokens a mano |
| **Web** | Next.js 16 (App Router) · TanStack Query · Tailwind CSS · puerto 3000 | Estándar actual de React |
| **Móvil** | Aplazado: no está en el repositorio todavía | La prioridad es la web; entra en una épica posterior |
| **Pruebas** | Vitest | Una sola herramienta para dominio y casos de uso |
| **CI** | GitHub Actions: lint + tests + build | Un pipeline sencillo |
| **Despliegue** | *A definir (ADR-002) antes del Sprint 2* | — |

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
| **Entornos** | Dos proyectos Supabase: `panamericana-staging` y `panamericana-prod`. |
| **Cambios de esquema** | Solo por migraciones. **Prohibido** crear o editar tablas desde el panel en staging/prod. |

---

## 5. Concurrencia de Asientos (ADR-001)

**Problema:** dos compradores eligen el mismo asiento del mismo viaje al mismo tiempo.

| # | Defensa | Qué hace |
|---|---|---|
| 1 | **Retención temporal** | Al iniciar la compra, el asiento queda *reservado* por unos minutos y los demás lo ven ocupado. |
| 2 | **Bloqueo en transacción** | Al confirmar, la transacción bloquea el registro con `select ... for update`, así las confirmaciones se atienden de una en una. |
| 3 | **Restricción `unique` en la BD** | PostgreSQL rechaza una segunda venta activa del mismo asiento en el mismo viaje, aunque la aplicación falle. |

- El conflicto se convierte en el error de dominio `AsientoNoDisponibleError` y en una respuesta **HTTP 409** definida en el contrato.
- Funciona igual en Supabase porque es PostgreSQL real con transacciones.

---

## 6. Base de Datos: Flujo de Aprobación y Restricciones

### 6.1 Flujo de aprobación del modelo de datos

```
1. Modelo v0.9 (PROPUESTA_BD.md)
2. Se comparte con todo el equipo  →  comentarios hasta la fecha límite
3. Se consolidan los cambios  →  versión v1.0
4. Aprobación en reunión de equipo
5. Nombres de tablas y campos CONGELADOS
6. Migración inicial en Supabase staging  →  luego prod
```

### 6.2 Restricciones obligatorias

| # | Regla |
|---|---|
| **R1** | **Todas las palabras reservadas SQL en minúsculas**: `create table`, `select`, `insert into`, `not null`, `primary key`, `references`, `unique`, etc. |
| **R2** | Los nombres de tablas y campos son **exactamente** los de la versión aprobada del modelo de datos. Se usan **idénticos** en la BD, las entidades, los DTOs y el JSON de la API (p. ej. `numero_pisos` en todas partes). |
| **R3** | Una vez aprobado, **ningún campo se renombra** en migraciones posteriores. |
| **R4** | Sin ORM ni alias de columnas: SQL escrito a mano con `pg`. |
| **R5** | Migraciones con Supabase CLI: versionadas, revisadas en PR y **solo hacia adelante** en producción. |
| **R6** | Los mappers solo convierten **tipos** (p. ej. `numeric` → `number`), nunca nombres. |
| **R7** | El checklist del PR verifica R1–R6. La verificación automática (sqlfluff) se agrega en E10. |

---

## 7. Marco de Trabajo Scrum

### 7.1 Calendario

| Sprint | Fechas | Estado |
|---|---|---|
| **Sprint 0** — Fundaciones | 2026-09-14 → 2026-09-25 | ✅ Confirmado |
| **Sprint 1** | 2026-09-28 → 2026-10-09 | ✅ Confirmado |
| Sprint 2 | 2026-10-12 → 2026-10-23 | Proyectado |
| Sprint 3 | 2026-10-26 → 2026-11-06 | Proyectado |
| Sprint 4 | 2026-11-09 → 2026-11-20 | Proyectado |
| Sprint 5 | 2026-11-23 → 2026-12-04 | Proyectado |
| Sprint 6 | 2026-12-07 → 2026-12-18 | Proyectado |

### 7.2 Ceremonias

| Ceremonia | Cuándo | Duración | Facilita |
|---|---|---|---|
| Sprint Planning | Lunes de inicio | ≤ 2 h | Ángel |
| Daily | Diario (presencial, virtual o asíncrono en Trello) | 15 min | Ángel |
| Refinamiento | Mitad de sprint | 1 h | Ángel |
| Sprint Review | Viernes de cierre | 1 h | Ángel |
| Retrospectiva | Viernes de cierre | 45 min | Ángel |

### 7.3 Flujo del tablero

`To Do` → `In Progress` → `Review` → `Done`

- **In Progress:** existe una rama y un PR en borrador enlazado a la tarjeta.
- **Review:** el PR está abierto, CI en verde y tiene revisor asignado (tabla 2.4).
- **Done:** PR fusionado, desplegado en staging y DoD verificado.

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
- [ ] API conforme al contrato OpenAPI
- [ ] SQL en minúsculas y nombres idénticos al modelo aprobado (R1–R6)
- [ ] PR aprobado por el revisor
- [ ] Desplegado en staging y criterios de aceptación validados

### 7.6 Convenciones Git

| Elemento | Convención |
|---|---|
| Estrategia | Ramas cortas (≤ 3 días) hacia `main` |
| Ramas | `feature/PAN-<id>-descripcion` · `fix/PAN-<id>-...` · `contract/PAN-<id>-...` · `db/PAN-<id>-...` |
| Commits | Conventional Commits: `feat:`, `fix:`, `contract:`, `db:`, `test:`, `docs:` |
| `main` protegida | PR obligatorio, CI en verde y 1 aprobación |
| Trazabilidad | ID de tarjeta `PAN-<id>` en rama, commit y PR |

---

## 8. Roadmap de Épicas

| Épica | Nombre | Backend | Frontend | Sprint |
|---|---|---|---|---|
| **E0** | Fundaciones: estructura base, módulo ejemplo `buses`, CI, BD v1.0 en Supabase | John + Grisel · Ángel (CI) | Brisa (web base) · Karime (móvil base) | 0 |
| **E1** | Identidad y acceso (login, roles) | John | Brisa (backoffice) · Karime (cliente) | 1 |
| **E2** | Clientes | Grisel | Grisel | 1 |
| **E3** | Terminales, buses y croquis de asientos | Ángel | Brisa | 1–2 |
| **E4** | Rutas y programación de viajes | Ángel | Brisa | 2–3 |
| **E5** | Venta de pasajes web (concurrencia) | John | Karime | 3–4 |
| **E6** | Encomiendas | Grisel | Grisel | 3–4 |
| **E7** | Taquilla (venta presencial) | John | Brisa | 4 |
| **E8** | App móvil de compra *(aplazada: entra cuando la web esté estable)* | John | Karime | — |
| **E9** | Reportes | Grisel | Grisel | 5–6 |
| **E10** | Endurecimiento para producción | Todos | Todos | 6 |

> **Módulo de referencia:** en el Sprint 0, John y Grisel implementan `buses` completo siguiendo `ARQUITECTURA_CLEAN.md`. Ese módulo sirve de plantilla para todos los demás.

---

## 9. Riesgos

| Riesgo | Prob. | Impacto | Mitigación | Responsable |
|---|---|---|---|---|
| Doble venta de asientos | Media | Crítico | ADR-001 (tres defensas) + prueba concurrente | John |
| Curva de aprendizaje de Clean Architecture | Alta | Alto | Guía sencilla, módulo de referencia `buses`, revisión cruzada | John + Ángel |
| Frontend bloqueado esperando la API | Alta | Alto | API-First + mock con Prism | Ángel (vigila) |
| Modelo de datos cambiante tras aprobación | Media | Alto | Ronda de comentarios antes de congelar (6.1) | Ángel |
| Exposición de datos por la API automática de Supabase | Media | Crítico | RLS sin políticas públicas + claves solo en backend (4.1) | John |
| SM con poco tiempo para desarrollar | Media | Medio | 40 % SM, WIP 1, módulos CRUD | Ángel |
| Sobrecarga de un integrante | Media | Medio | Reglas 2.6 revisadas en cada Planning | Ángel |
| Semanas de exámenes | Alta | Medio | Capacidad ≤ 80 %, ajustar el sprint afectado | Ángel |

---

## 10. Pendientes para la Siguiente Iteración

| # | Pendiente | Estado |
|---|---|---|
| 1 | Validar roles | ✅ Hecho (v0.2) |
| 2 | Correos o usuarios de Trello de los 5 integrantes | ⏳ En espera |
| 3 | Espacio de trabajo de Trello | ✅ Cualquiera |
| 4 | Fechas de Sprint 0 y 1 | ✅ Confirmadas |
| 5 | Comentarios del equipo sobre `PROPUESTA_BD.md` → v1.0 | ⏳ Por compartir |
| 6 | Decidir despliegue (ADR-002) | ⏳ Antes del Sprint 2 |
