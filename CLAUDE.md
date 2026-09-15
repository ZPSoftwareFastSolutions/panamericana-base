# CLAUDE.md — panamericana-base (Repositorio 1)

Proyecto "Panamericana": sistema web de gestión de transporte (pasajes, flota, rutas, viajes, encomiendas). Equipo de 5: Ángel Paredes (Scrum Master + Backend), John Zabaleta (Backend), Grisel (Backend + Frontend), Brisa (Frontend), Karime (Frontend). Documentos y respuestas en español.

## Los dos repositorios (regla crítica)

| | Repositorio 1 — `panamericana-base` (este) | Repositorio 2 — `panamericana` |
|---|---|---|
| Acceso | John y Ángel (Z&P) | Los 5 integrantes |
| Contenido | Stack + todos los `.md` de contexto + este `CLAUDE.md` | **Solo el stack** |

- **El Repositorio 2 NO contiene ningún `.md`** excepto un `README.md` básico de proyecto amateur (plantilla en `docs/repo2/README.md`). Sin `docs/`, sin ADR, sin guías, sin `CLAUDE.md`, sin `.claude/`, sin plantilla de PR, sin nada "raro".
- Por eso el código del stack (comentarios incluidos) **no debe referenciar** documentos internos (`ADR-*`, `PROPUESTA_BD`, reglas `R1`–`R7`, épicas, guías). Los comentarios explican por sí mismos.
- El Repositorio 2 lo administra la cuenta **AngelParedesH20**. La cuenta Z&P (`ZPSoftwareFastSolutions`) no debe figurar allí: ni como autora de commits ni como colaboradora.
- Claude **nunca** accede, lee ni edita el Repositorio 2. La transferencia es manual (Ángel copia archivos); ver `REPLICACION_REPO2.md`.

## Stack

npm workspaces: `shared/` (rutas de la API y tipos), `backend/` (Node 24 + TypeScript + Express 5 + Zod + `pg`, puerto 4000), `web/` (Next.js 16 + Tailwind + TanStack Query, puerto 3000). Base de datos PostgreSQL en Supabase. Despliegue en Vercel + Supabase (ADR-002) en la **fase final** (fecha a definir): hasta entonces todo corre en local. Canal móvil como PWA en el MVP; app nativa fuera del MVP.

## Calendario y alcance (vigente desde 2026-09-15)

- **Contexto Bolivia (La Paz):** documentos `ci`/`ce`/`pasaporte` (sin `dni`), placas `1234ABC` (regla en `Bus.crear`), celulares de 8 dígitos, montos en bolivianos, hora de La Paz. No usar datos de ejemplo de otros países.
- **3 sprints, fijados por el docente:** Sprint 1 **08/09 → 19/09** · Sprint 2 **22/09 → 03/10** · Sprint 3 **06/10 → 17/10, sin confirmar**. Ya **no existe Sprint 0** ni los Sprints 4–6: cualquier mención a ellos es obsoleta.
- **Fuente única del alcance:** `PRODUCT_BACKLOG.md` (épicas E0–E11, historias HU-###, tarjetas PAN-## por sprint, carga por integrante, contingencia si el Sprint 3 no se confirma). Cambios de fechas o alcance se reflejan ahí y en `PLANIFICACION.md` sección 7.1.
- **Tecnologías emergentes (requisito de la asignatura):** cloud computing (Vercel + Supabase) y machine learning (predicción de demanda por regresión, HU-033, Must). El chatbot (HU-034) es Could y no reemplaza a la predicción. Big data no se declara. Ver `PLANIFICACION.md` sección 9.

```bash
npm install            # solo en la raíz
npm run dev:backend
npm run dev:web
npm test
npm run lint
npm run build
npm run db:verificar   # prueba la conexión a la base
```

## Arquitectura

- Backend por módulo y capa: `backend/src/modulos/<modulo>/{dominio,casos-de-uso,adaptadores}`. Dependencias solo hacia adentro. `contenedor.ts` es el único lugar con `new`; `rutas.ts` registra los routers.
- Las direcciones de la API se declaran **solo** en `shared/src/endpoints.ts`.
- Web: `web/src/modulos/<modulo>/{servicios,hooks,componentes}`; los componentes nunca usan `fetch`.
- El módulo `buses` es la referencia de punta a punta.

## Base de datos

- Proyecto Supabase `panamericana`, ref `tvyhpwpyxmbdfxogopnl`, us-east-1. **Compartido por ambos repositorios**: no hacer cargas masivas de datos desde aquí.
- Conexión: **Session pooler** `postgresql://postgres.tvyhpwpyxmbdfxogopnl:<contraseña>@aws-0-us-east-1.pooler.supabase.com:5432/postgres`. La conexión directa `db.<ref>.supabase.co` es solo IPv6 y falla con `ENOTFOUND`. La contraseña vive solo en `backend/.env` (ignorado por git); nunca en archivos versionados.
- SQL con palabras reservadas **en minúsculas**. Nombres de tablas y campos **congelados** (modelo v1.0, 16 tablas) y usados idénticos en BD, backend y web (`numero_pisos`).
- Cambios de esquema solo con migraciones nuevas en `supabase/migrations/` (solo hacia adelante). Toda tabla con RLS activado y sin políticas públicas. 6 migraciones aplicadas (la última: `documentos_bolivia`).
- Autenticación: Supabase firma los tokens con **ECC P-256** → la API valida con JWKS; `SUPABASE_JWT_SECRET` no se usa. No revocar la clave HS256 anterior hasta desactivar las claves *legacy* `anon`/`service_role`.

## Documentos de contexto

`PLANIFICACION.md` (roles, calendario, tecnologías emergentes) · `PRODUCT_BACKLOG.md` (épicas, historias y tarjetas del MVP) · `ARQUITECTURA_CLEAN.md` (guía de trabajo) · `PROPUESTA_BD.md` (modelo v1.0) · `REPLICACION_REPO2.md` (montaje del repo 2) · `docs/adr/` · `docs/guias-sprint/` (guías por sprint, se usan para crear tarjetas de Trello, no se copian).

## Forma de trabajo

- Iterativa: entregar `.md` paso a paso cuando se planifica.
- `git push` a veces lo bloquea el clasificador de permisos: en ese caso, dejar el commit hecho y pedir al usuario que haga `git push`.
- Trello: tablero `Panamericana` creado el 15/09 con el Sprint 1 (PAN-01 a PAN-08; PAN-09 archivada porque el despliegue pasa a la fase final). Solo se carga el Sprint 1 hasta que el usuario pida más: https://trello.com/b/ida3R2kt/panamericana. Cuenta conectada: "Oya Oya", espacio *DarkMode*. La integración **no invita miembros ni asigna responsables** (el responsable va en el título de la tarjeta). Las tarjetas **no mencionan** documentos internos, el repositorio base ni herramientas de IA.
- El contrato que ve el equipo es `shared/src/` (el repositorio del equipo no tiene `docs/api/openapi.yaml`).
