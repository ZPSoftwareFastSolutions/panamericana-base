# Panamericana — Sistema de Gestión

Sistema web para venta de pasajes, gestión de flota, rutas y encomiendas de la empresa de transporte **Panamericana**.

> **Repositorio privado de trabajo (Repositorio 1).** Acceso: John Zabaleta y Ángel Paredes.
> El repositorio del equipo completo es el **Repositorio 2** (`AngelParedesH20/panamericana`, ver [REPLICACION_REPO2.md](REPLICACION_REPO2.md)).
> **Contexto:** Bolivia (La Paz) · Sprint 1 en curso · todo corre en local.
> **Para retomar el trabajo en una sesión nueva, empezar por [CLAUDE.md](CLAUDE.md).**

---

## Arranque rápido

```bash
npm install
```

```bash
cp backend/.env.example backend/.env
```

```bash
cp web/.env.local.example web/.env.local
```

Completa `backend/.env` con los datos de Supabase y levanta el proyecto en dos terminales:

```bash
npm run dev:backend
```

```bash
npm run dev:web
```

| Dirección | Qué es |
|---|---|
| http://localhost:4000/salud | La API responde |
| http://localhost:3000 | La web |
| http://localhost:3000/admin/buses | Panel administrativo (módulo de ejemplo) |

**La guía completa del flujo de trabajo está en [ARQUITECTURA_CLEAN.md](ARQUITECTURA_CLEAN.md).** Léela antes de escribir código.

---

## Estructura

```
shared/      contrato compartido: direcciones de la API y tipos de datos
backend/     API REST — Node.js + TypeScript + Express (Clean Architecture)
web/         Next.js 16 — portal público + backoffice
supabase/    migraciones .sql y datos de prueba
docs/        decisiones (ADR), guías por sprint y archivos para el repositorio del equipo
```

El módulo **`buses`** está implementado de punta a punta (base de datos → API → pantalla) y sirve de plantilla para los demás.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev:backend` | Levanta la API en el puerto 4000 |
| `npm run dev:web` | Levanta la web en el puerto 3000 |
| `npm test` | Pruebas del backend |
| `npm run lint` | Revisa el estilo del código |
| `npm run build` | Compila todo, igual que el servidor de integración |
| `npm run db:verificar` | Comprueba la conexión con la base de datos |

---

## Documentación

| Documento | Contenido |
|---|---|
| [CLAUDE.md](CLAUDE.md) | **Punto de entrada:** contexto, estado actual, próximos pasos y reglas |
| [ARQUITECTURA_CLEAN.md](ARQUITECTURA_CLEAN.md) | Guía de trabajo: puesta en marcha, capas, flujo completo y recetas |
| [PLANIFICACION.md](PLANIFICACION.md) | Roles, calendario de 3 sprints, reglas, roadmap y tecnologías emergentes |
| [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md) | Épicas, historias de usuario y tarjetas por sprint del MVP |
| [PROPUESTA_BD.md](PROPUESTA_BD.md) | Modelo de datos v1.0, ya creado en Supabase (16 tablas) |
| [REPLICACION_REPO2.md](REPLICACION_REPO2.md) | Cómo se crea y sincroniza el repositorio del equipo |
| `docs/api/openapi.yaml` | Referencia interna del módulo `buses` (no se mantiene; el contrato vigente es `shared/src/`) |
| `docs/adr/` | Decisiones de arquitectura |
| `docs/guias-sprint/` | Guías por sprint (se convierten en tarjetas de Trello) |
| `docs/repo2/README.md` | README básico que se copia al Repositorio 2 (el único `.md` que va allí) |
| `docs/repo2/CORRECCIONES_NN.md` | Cambios puntuales que Ángel aplica en el Repositorio 2 (01 ✅ aplicada) |

---

## Reglas del proyecto

1. **Clean Architecture:** las dependencias apuntan hacia adentro.
2. **Un solo lugar para cada dirección de la API:** `shared/src/endpoints.ts`.
3. **SQL en minúsculas** y nombres de campos idénticos al modelo aprobado (R1–R6).
4. **Datos y reglas bolivianas:** `ci`/`ce`/`pasaporte`, placas `1234ABC`, montos en bolivianos.
5. **Un dato se llama igual** en la base, en el backend y en la web (`numero_pisos`).
6. **Cambios de esquema solo por migraciones**, nunca desde el panel de Supabase.
7. **Nunca subir claves ni archivos `.env`.**
