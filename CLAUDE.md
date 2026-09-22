# CLAUDE.md — panamericana-base

> **Punto de entrada para cualquier sesión.** Léelo completo antes de actuar. Última actualización: **22/09/2026**.
> Idioma de trabajo: **español** (documentos, respuestas, commits y comentarios del código).

---

## 1. Contexto del proyecto

- **Qué es:** sistema de gestión para **Panamericana**, empresa de transporte de pasajeros y encomiendas en **Bolivia (La Paz)**. Cubre venta de pasajes por tramos (web, taquilla y móvil como PWA), flota y croquis de asientos, rutas con paradas, viajes y tarifas, encomiendas, boleto con QR y un panel de indicadores con **predicción de demanda** (la predicción está en el título del proyecto).
- **Marco:** proyecto universitario (curso *Proyecto III*, 6.º semestre) con Scrum. El docente fija los sprints. La asignatura exige incorporar una **tecnología emergente**: el proyecto usa *cloud computing* (despliegue en Vercel + Supabase) y *machine learning* (regresión para la predicción de demanda). Big data **no** se declara.
- **Objetivo:** un sistema pensado para producción. Hoy **todo corre en local**; el despliegue queda para la fase final.
- **Requisito crítico:** nunca vender dos veces el mismo asiento en tramos que se cruzan de un mismo viaje.
- **Contexto Bolivia (obligatorio en datos y reglas):** documentos `ci` (carnet de identidad), `ce` (cédula de extranjero) y `pasaporte` — **nunca `dni`**; placas `1234ABC` (3 o 4 dígitos y 3 letras); celulares de 8 dígitos; montos en **bolivianos (Bs)**; hora de **La Paz (UTC−4)**; feriados bolivianos. No usar datos de ejemplo de otros países.

---

## 2. Equipo

| Integrante | Rol | Dedicación | Cuentas y correo |
|---|---|---|---|
| **Ángel Fabricio Paredes Campos** | Scrum Master + Backend (operaciones) | 40 % SM · 60 % BE | GitHub **AngelParedesH20** (administra el repositorio del equipo) · correo: *no proporcionado* |
| **John Martín Zabaleta Cano** | Backend (base, identidad, comercial) | 100 % BE | zcj2029794@est.univalle.edu |
| **Grisel** | Backend + Frontend (clientes, encomiendas, reportes) | 50 % · 50 % | griselabigaila@gmail.com |
| **Brisa** | Frontend (backoffice y taquilla) | 100 % FE | maytasindel@gmail.com |
| **Karime** | Frontend (portal público y PWA) | 100 % FE | tsk2029776@est.univalle.edu |

- **Z&P Software Fast Solutions** es la marca de John y Ángel: GitHub `ZPSoftwareFastSolutions`, correo `zapasoftwarefastsolutions@gmail.com`, organización de Supabase del mismo nombre. Es la identidad global de git en la computadora de trabajo.
- *Ownership*, capacidad y revisores: `PLANIFICACION.md` §2. Ajustes temporales por sprint: `PRODUCT_BACKLOG.md` §6.

---

## 3. Los dos repositorios (regla crítica)

| | **Repositorio 1 — `panamericana-base`** (este) | **Repositorio 2 — `panamericana`** |
|---|---|---|
| GitHub | `ZPSoftwareFastSolutions/panamericana-base` (privado) | `AngelParedesH20/panamericana` (privado) |
| Carpeta local | `F:\Universidad\6to\Proyecto III\project_bus` | `F:\Universidad\6to\Proyecto III\panamericana` |
| Acceso | John y Ángel | Los 5 integrantes |
| Contenido | Stack + todos los `.md` de contexto + este archivo | **Solo el stack** + un `README.md` básico |
| Claude | Trabaja aquí | **Nunca** accede, lee ni edita |

**Reglas:**
1. **Grisel, Brisa y Karime no saben que existe este repositorio.** Nada que ellas vean (repositorio 2, Trello, mensajes para el equipo) puede mencionar el repositorio base, documentos internos (`ADR-*`, `PROPUESTA_BD`, reglas `R1`–`R7`, guías), la cuenta Z&P ni herramientas de IA.
2. El repositorio 2 **no contiene ningún `.md`** salvo el README básico (plantilla: `docs/repo2/README.md`). Sin `docs/`, sin plantilla de PR, sin `CLAUDE.md` ni `.claude/`.
3. Por eso **el código del stack** (comentarios, `.env.example`, migraciones, `seed.sql`, `.gitignore`) no referencia documentos internos. Antes de dar por listo un cambio del stack, buscar rastros: `grep -rnEi "ADR-|PROPUESTA_BD|ARQUITECTURA_CLEAN|PLANIFICACION|REPLICACION|CORRECCIONES|claude" backend shared web supabase`.
4. El repositorio 2 lo administra **AngelParedesH20**. En esa carpeta git usa la identidad y las credenciales de Ángel; **Z&P no figura** ni como autora de commits ni como colaboradora.
5. La transferencia es **manual y la hace Ángel**: copia completa inicial con `robocopy` (`REPLICACION_REPO2.md` §4) y cambios puntuales documentados en `docs/repo2/CORRECCIONES_NN.md`. Nunca remotos cruzados ni `push` entre repositorios.
6. Los commits de este repositorio llevan la línea `Co-Authored-By` de Claude: está bien, porque el historial nunca se copia.

---

## 4. Estado actual (22/09/2026)

**Hecho**
- Stack base con el módulo **`buses`** de punta a punta: BD → API → pantalla (11–12/09).
- Base de datos en Supabase: **modelo v2.0 normalizado (22/09)** — 26 tablas, 4 vistas, 10 migraciones, datos de prueba bolivianos. La protección por tramos y la integridad del tramo se verificaron contra la base real.
- Plan v0.5 y `PRODUCT_BACKLOG.md` validados; sin rupturas de arquitectura.
- **Repositorio 2 montado por Ángel (15/09)** y `docs/repo2/CORRECCIONES_01.md` **aplicadas**: autoría corregida a AngelParedesH20 y 6 archivos ajustados para Bolivia.
- Tablero de Trello con el Sprint 1 (PAN-01 a PAN-08).
- **Guía de desarrollo del equipo** (`docs/equipo/GUIA_DESARROLLO.md`, 15/09): cómo crear y llamar endpoints, `shared`, servicios, hooks, componentes `.tsx`, páginas, reglas, git y uso de asistentes de IA. Su ejemplo, el módulo `choferes`, se **extrajo, compiló (lint, 8 pruebas, build) y probó contra la base real** y luego se retiró del stack. La copia con el `.env` completo está en `compartir/GUIA_DESARROLLO_PANAMERICANA.md`, ignorada por git.

**En curso:** Sprint 2 (22/09 → 03/10). El Sprint 1 cerró el 19/09; **falta registrar el resultado de su Review** en el backlog.

**Próximos pasos (en orden)**
0. **Entregar al equipo la corrección del modelo v2.0** (`docs/repo2/CORRECCIONES_02.md`) y la guía actualizada, **antes** de que empiecen las tarjetas PAN-13 a PAN-23.
1. **Invitar al equipo al tablero de Trello:** hoy el único miembro es la cuenta conectada "Oya Oya". La integración no envía invitaciones: se hace desde la interfaz de Trello con los correos del §2 (falta el de Ángel).
2. **Compartir la guía con el equipo:** enviar `compartir/GUIA_DESARROLLO_PANAMERICANA.md` por un canal privado. **No** se sube al repositorio 2 (regla: sin `.md`).
3. **PAN-02 (Ángel):** colaboradores en GitHub, protección de `main` y ramas `dev/*`.
4. **Review del Sprint 1 (sábado 19/09):** marcar ✅ en el backlog, recalibrar la capacidad con la velocidad real y pasar lo no terminado al inicio del Sprint 2 (backlog §7.3).
5. **Solo si el usuario lo pide:** escribir `docs/guias-sprint/GUIA_SPRINT_02.md` y cargar en Trello las tarjetas PAN-10 a PAN-23 antes del Planning del martes 22/09. Hasta entonces, **en Trello solo existe el Sprint 1**.
6. En la Review del Sprint 2 (03/10): **agendar la fase final de despliegue** (PAN-09 y PAN-24).
7. PAN-10 (Sprint 2): login con validación por JWKS. Después, desactivar las claves *legacy* y recién entonces revocar la clave HS256 (§8).
8. Confirmar con el docente si existe el Sprint 3 (si no, aplicar la contingencia del backlog §7.1).

---

## 5. Calendario y alcance

| Etapa | Fechas | Estado | Incremento |
|---|---|---|---|
| Sprint 1 — Base operativa | 08/09 → 19/09 | 🔄 En curso | Entorno local, terminales, usuarios, clientes y maqueta del portal |
| Sprint 2 — MVP 1 | 22/09 → 03/10 | Confirmado | Venta web por tramos con control de concurrencia y login del backoffice |
| Sprint 3 — MVP 2 | 06/10 → 17/10 | ⚠️ Sin confirmar | Taquilla, anulación, encomiendas, boleto QR, panel con predicción de demanda y PWA |
| Fase final — Nube | Fecha a definir | ⏳ | Despliegue en Vercel + Supabase (obligatorio: sostiene *cloud computing*) |

- **No existen** el Sprint 0 ni los Sprints 4–6 (calendarios anteriores anulados).
- Los sprints van de martes a sábado: Planning el martes; Review y Retrospectiva el sábado.
- **Fuente única del alcance:** `PRODUCT_BACKLOG.md` (épicas E0–E11, historias HU-001 a HU-034, tarjetas PAN-01 a PAN-40; las nuevas se numeran desde **PAN-41**).
- **Decisiones de alcance del MVP:** compra como invitado · retención del asiento 10 min · pago simulado (web `tarjeta`, taquilla `efectivo`) · anulación hasta 2 h antes, solo en taquilla · tarifas por viaje · precio del tramo proporcional al tiempo, redondeado a Bs 0,50 · móvil como PWA (app nativa fuera) · las reservas vencidas se liberan al consultar o reservar, sin *cron*.

---

## 6. Stack y comandos

- **npm workspaces:** `shared/` (rutas de la API y tipos), `backend/` (Node 24 + TypeScript + Express 5 + Zod + `pg`, puerto **4000**), `web/` (Next.js 16 + React + Tailwind + TanStack Query, puerto **3000**).
- **Base de datos:** PostgreSQL en Supabase. **Pruebas:** Vitest. **CI:** GitHub Actions (lint, pruebas y build).
- **Más adelante:** predicción de demanda con Python + scikit-learn en un notebook, exportando coeficientes a JSON que lee la API (la API no ejecuta Python). PWA en el Sprint 3. Despliegue en la fase final (ADR-002).

```bash
npm install            # SOLO en la raíz
npm run dev:backend    # API en http://localhost:4000 (/salud)
npm run dev:web        # web en http://localhost:3000 (/admin/buses)
npm test
npm run lint
npm run build          # compila shared, backend y web
npm run db:verificar   # prueba la conexión y lista las tablas
```

---

## 7. Arquitectura (detalle en `ARQUITECTURA_CLEAN.md`)

- **Backend por módulo y capa:** `backend/src/modulos/<modulo>/{dominio,casos-de-uso,adaptadores}`. Las dependencias apuntan hacia adentro; el dominio no importa librerías ni `@panamericana/shared`.
- `contenedor.ts` es el único lugar con `new`; `rutas.ts` registra los routers; `infraestructura/` tiene la configuración, la conexión y el servidor.
- **Errores:** cada error de negocio extiende `ErrorDeDominio` con `codigo` y `estadoHttp`, y `manejadorErrores.ts` los traduce (Zod → 400). La violación `23P01` de la base se convierte en `AsientoNoDisponibleError` (409) **dentro del repositorio**.
- **Contrato:** las direcciones y los tipos se declaran **solo** en `shared/src/` (`endpoints.ts`, `tipos/`). `docs/api/openapi.yaml` existe solo aquí, como referencia interna del módulo `buses`, y no se mantiene.
- **Web:** `web/src/modulos/<modulo>/{servicios,hooks,componentes}` y páginas en `web/src/app/`. Los componentes nunca usan `fetch`.
- **Rutas de Next.js:** los grupos entre paréntesis no cambian la URL. `app/page.tsx` y `app/(publico)/page.tsx` chocan en `/`, así que al crear el portal público se elimina `app/page.tsx` (tarjeta PAN-08).
- **Un dato se llama igual** en la base, el backend y la web (`numero_pisos`).
- **Módulo de referencia:** `buses` (incluye la regla de placa boliviana en `Bus.crear`).

---

## 8. Base de datos

- **Proyecto Supabase:** `panamericana` · ref `tvyhpwpyxmbdfxogopnl` · `us-east-1` · PostgreSQL 17 · organización Z&P · costo $0. **Lo comparten ambos repositorios:** desde aquí no se hacen cargas masivas; es el espacio de pruebas del equipo.
- **Conexión (Session pooler, verificada):** `postgresql://postgres.tvyhpwpyxmbdfxogopnl:<contraseña>@aws-0-us-east-1.pooler.supabase.com:5432/postgres`.
  - La conexión directa `db.<ref>.supabase.co` es solo IPv6 y falla con `ENOTFOUND`.
  - `aws-1-...` responde `tenant not found`.
  - La contraseña vive **solo** en `backend/.env` (ignorado por git). Nunca va a archivos versionados, documentos, Trello ni commits.
- **Reglas:** SQL con palabras reservadas en minúsculas · nombres de tablas y campos **congelados** (modelo v2.0, recongelados el 22/09) · cambios solo con **migraciones nuevas**, hacia adelante · toda tabla con RLS activado y sin políticas públicas (datos solo por la API) · **un dato que se puede calcular no se guarda**: va en una vista.
- **Modelo v2.0 (22/09), normalizado hasta 5FN** (`docs/bd/ANALISIS_NORMALIZACION.md`): `personas` única + `usuarios`/`clientes`/`choferes` como roles · `usuarios_roles` · 8 catálogos con el código como clave (`tipos_documento`, `tipos_asiento`, `roles`, `canales_venta`, `metodos_pago`, `categorias_licencia`, `departamentos`, `ciudades`) · 4 vistas para los datos calculados · claves naturales en `rutas_paradas`, `viajes_choferes` y `tarifas` · claves foráneas compuestas que garantizan el tramo en `pasajes`.
- **Migraciones aplicadas (10):** `buses` · `funciones_y_personas` · `flota_y_rutas` · `ventas_pasajes_pagos` (restricción de exclusión por tramo `pasajes_asiento_sin_traslape`, `btree_gist`) · `encomiendas` · `documentos_bolivia` · `catalogos` · `personas` · `derivados_y_vistas` · `integridad_y_claves`.
- **Flujo para una migración nueva desde Claude:**
  1. Aplicarla con el MCP de Supabase (`apply_migration`).
  2. Leer la versión asignada con `list_migrations`.
  3. Guardar el archivo como `supabase/migrations/<version>_<nombre>.sql` con el mismo SQL.
  4. Actualizar `PROPUESTA_BD.md`.
  5. Si el cambio va al equipo, registrarlo en `docs/repo2/CORRECCIONES_NN.md`.
- **Datos de prueba** (`supabase/seed.sql`, IDs fijos `00000000-0000-4000-8000-000000000xxx`, personas `...a0xx`): 5 personas, 2 usuarios con rol, 2 clientes, 1 chofer, terminales La Paz, Oruro y Cochabamba, buses `2045KLP` y `3187HTR`, 4 asientos, ruta La Paz → Oruro → Cochabamba, 1 viaje, 3 tarifas, 1 venta con pasaje (tramo 1→2) y pago. El archivo es **idempotente**. Si se prueban inserciones, **borrar lo creado** al terminar.
- **Autenticación:** Supabase firma los tokens con **ECC P-256** (clave actual `4190b38b-…`). La API los valida con el JWKS `https://tvyhpwpyxmbdfxogopnl.supabase.co/auth/v1/.well-known/jwks.json` (`ES256`, audiencia `authenticated`). `SUPABASE_JWT_SECRET` **no se usa**. La web usará la clave publicable `sb_publishable_…`. **No revocar** la clave anterior Legacy HS256 hasta desactivar las claves *legacy* `anon` y `service_role`.

---

## 9. Trello

- **Tablero:** https://trello.com/b/ida3R2kt/panamericana (privado) · cuenta conectada **"Oya Oya"** · espacio de trabajo *DarkMode*.
- **Listas** (el equipo las renombró; respetar esos nombres): `Por Hacer` → `En Progreso` → `Testing` → `Completao`.
- **Tarjetas:** Sprint 1, PAN-01 a PAN-08, con fecha límite 19/09 09:00 de La Paz (`2026-09-19T13:00:00.000Z`). **PAN-09 está archivada** porque el despliegue pasó a la fase final.
- **Formato de tarjeta:**
  - Título: `PAN-xx · Trabajo · Responsable · N pts`.
  - Descripción (máx. 2048 caracteres): historia de usuario, archivos a crear, reglas de negocio, rama y revisor.
  - Checklist "Criterios de aceptación".
- **Límites de la integración:** no invita miembros, no asigna responsables y no crea etiquetas. Las fechas van en UTC.
- **Contenido:** nada de documentos internos, repositorio base, Z&P ni IA (regla §3.1).
- Solo se cargan sprints **cuando el usuario lo pide**.

---

## 10. Flujo de trabajo del equipo (repositorio 2)

- **Ramas:** `main` protegida (PR, 1 aprobación, CI en verde) y una rama por integrante: `dev/angel`, `dev/john`, `dev/grisel`, `dev/brisa`, `dev/karime`. Traer `main` a la rama todos los días.
- **Por cada tarjeta:** commit `feat(PAN-xx): ...` → PR hacia `main` → revisor → mover la tarjeta a `Testing`.
- **Revisores:** John ← Grisel · Ángel ← John · Grisel (BE) ← John · Grisel (FE) ← Brisa · Brisa ← Karime · Karime ← Brisa. Las tarjetas de Ángel las valida John.
- **Terminado (DoD):** capa correcta · pruebas en verde · rutas y tipos en `shared/src/` · SQL en minúsculas con nombres congelados · PR aprobado · criterios validados **en local** (en staging desde la fase final).
- **Receta de un módulo nuevo:** copiar la forma de `buses` (`ARQUITECTURA_CLEAN.md` §8).

---

## 11. Cómo trabajar en esta sesión

- **Iterativo:** entregar `.md` paso a paso al planificar; recomendar en lugar de listar opciones sin postura.
- **Acciones externas** (Trello, Supabase, GitHub): confirmar alcance con lo pedido por el usuario. Nunca tocar el repositorio 2.
- **Cambios en el stack:** ejecutar `npm run lint`, `npm test` y `npm run build` antes del commit, y luego la búsqueda de rastros de la §3.3.
- **Cambios que deben llegar al equipo:** documentarlos en `docs/repo2/CORRECCIONES_NN.md` (la siguiente es **02**) con la tabla de archivos, el comando de copia, la verificación y el estado. Avisar al usuario.
- **Git:** commits en español, estilo *conventional*, con la línea de atribución. Ejecutar `git add`, `git commit` y `git push` **en llamadas separadas**: el clasificador de permisos bloquea a veces los comandos encadenados o el `push`. Si el `push` se bloquea, dejar el commit hecho y pedir al usuario que ejecute `git push`.
  - La computadora guarda **dos cuentas de GitHub** (Z&P y AngelParedesH20). Por eso el remoto de este repositorio lleva el usuario en la URL (`https://ZPSoftwareFastSolutions@github.com/ZPSoftwareFastSolutions/panamericana-base.git`). Sin eso, el administrador de credenciales abre un selector de cuenta y el `push` se queda esperando.
- **Herramientas:**
  - Los *heredoc* muy largos (más de ~5 KB) fallan en la herramienta Bash: usar la herramienta de escritura de archivos.
  - Para parches con barras invertidas, escribir un script de Python con cadenas *raw* en el scratchpad.
- **Mantener al día los documentos** según la tabla del §12 cada vez que cambie algo.
- **Guía del equipo:** si cambia algo del stack que la guía enseña (estructura, `shared`, `clienteHttp`, convenciones, `.env`), actualizar `docs/equipo/GUIA_DESARROLLO.md`, volver a verificar su código y regenerar la copia de `compartir/`.
  - Verificación: extraer los bloques que empiezan con `// archivo:` y aplicar los fragmentos `// en:`; correr lint, pruebas y build; probar la API; **retirar el ejemplo** y borrar los datos de prueba.
  - La copia se genera reemplazando `<CONTRASEÑA_DE_LA_BASE>` con la `DATABASE_URL` de `backend/.env`. La versión versionada nunca lleva la contraseña.
  - Contenido limpio: sin repositorio base, Z&P, documentos internos ni códigos `HU-`. Solo puede mencionar asistentes de IA de forma genérica, como apoyo del integrante.
  - El ejemplo `choferes` **no** está en el stack a propósito. Si alguien implementa HU-013 (choferes), revisar que la guía no contradiga ese código.

---

## 12. Mapa de documentos

| Documento | Contenido | Actualizar cuando… |
|---|---|---|
| `CLAUDE.md` | Contexto, estado, reglas y forma de trabajo | Cambia el estado, una regla o un paso siguiente |
| `PLANIFICACION.md` | Roles, stack, reglas R1–R7, Scrum, calendario, roadmap, tecnologías emergentes, riesgos y pendientes | Cambian roles, fechas, reglas o riesgos |
| `PRODUCT_BACKLOG.md` | Épicas, historias, decisiones de alcance, tarjetas por sprint, carga y contingencia | Cambia el alcance, una tarjeta o su estado |
| `ARQUITECTURA_CLEAN.md` | Guía de trabajo: puesta en marcha, mapa del repositorio, flujo completo y recetas | Cambia la estructura o una convención |
| `PROPUESTA_BD.md` | Modelo de datos v1.0, migraciones, datos de prueba y preguntas abiertas | Hay una migración nueva |
| `REPLICACION_REPO2.md` | Reglas de aislamiento, copia al repositorio 2, ramas y sincronización | Cambia cómo se transfiere al equipo |
| `docs/adr/` | ADR-001 concurrencia · ADR-002 despliegue · ADR-003 Supabase | Se toma o cambia una decisión técnica |
| `docs/guias-sprint/` | `GUIA_SPRINT_01.md` y la plantilla (se convierten en tarjetas, no se copian) | Se planifica un sprint |
| `docs/repo2/` | `README.md` básico del repositorio 2 · `CORRECCIONES_NN.md` | Hay cambios para el equipo |
| `docs/bd/ANALISIS_NORMALIZACION.md` | Verificación de formas normales del modelo v1.0 y propuesta v2.0 (26 tablas + 4 vistas) | Se decide sobre la propuesta o cambia el modelo |
| `docs/equipo/GUIA_DESARROLLO.md` | Guía para los 5 integrantes con el ejemplo `choferes` y el `.env` (con marcador en lugar de la contraseña) | Cambia el stack, una convención o el `.env` |
| `compartir/` *(ignorada por git)* | Copia de la guía con el `.env` completo, lista para enviar al equipo | Se regenera cada vez que cambia la guía |

---

## 13. Decisiones clave (bitácora)

| Fecha | Decisión |
|---|---|
| 11/09 | Roles: Ángel SM + BE, John BE, Grisel BE + FE, Brisa FE, Karime FE |
| 11/09 | Stack sencillo para aprender: Express + TypeScript (no NestJS), Next.js, SQL a mano con `pg` (sin ORM) |
| 12/09 | npm workspaces con `shared/` como contrato único entre backend y web |
| 12/09 | Modelo v1.0 de 16 tablas con venta por tramos; restricción de exclusión contra la doble venta |
| 12/09 | Un solo proyecto de Supabase compartido por ambos repositorios; conexión por Session pooler |
| 14/09 | El repositorio 2 lleva solo el stack y un README básico |
| 15/09 | Calendario de 3 sprints fijado por el docente; `PRODUCT_BACKLOG.md` como fuente del alcance |
| 15/09 | Contexto Bolivia: `ci`/`ce`/`pasaporte` (migración `documentos_bolivia`), placas y datos bolivianos |
| 15/09 | Despliegue en Vercel pasa a la fase final; todo en local hasta entonces |
| 15/09 | Tokens ECC P-256 → validación por JWKS |
| 15/09 | El repositorio 2 lo administra AngelParedesH20; sin rastros de Z&P (correcciones aplicadas) |
| 15/09 | Trello solo con el Sprint 1 |
| 22/09 | Revisión de normalización: modelo **v2.0** (26 tablas + 4 vistas) con `personas`, catálogos, vistas para los datos calculados y integridad del tramo en la base. Descongelamiento **único** de nombres, hecho antes del código del Sprint 2; nombres recongelados |
