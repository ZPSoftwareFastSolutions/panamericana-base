# Panamericana — Sistema de Gestión

Sistema web para venta de pasajes, gestión de flota, rutas y encomiendas de la empresa de transporte **Panamericana**.

> **Repositorio privado de trabajo (Repositorio 1).** Acceso: John Zabaleta y Ángel Paredes.
> El repositorio del equipo completo es el **Repositorio 2** (ver [REPLICACION_REPO2.md](REPLICACION_REPO2.md)).

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
docs/        contrato OpenAPI, decisiones (ADR) y guías por sprint
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

---

## Documentación

| Documento | Contenido |
|---|---|
| [ARQUITECTURA_CLEAN.md](ARQUITECTURA_CLEAN.md) | Guía de trabajo: puesta en marcha, capas, flujo completo y recetas |
| [PLANIFICACION.md](PLANIFICACION.md) | Roles, sprints, reglas y roadmap |
| [PROPUESTA_BD.md](PROPUESTA_BD.md) | Modelo de datos (v0.9, en última revisión) |
| [REPLICACION_REPO2.md](REPLICACION_REPO2.md) | Cómo se crea y sincroniza el repositorio del equipo |
| `docs/api/openapi.yaml` | Contrato de la API |
| `docs/adr/` | Decisiones de arquitectura |

---

## Reglas del proyecto

1. **Clean Architecture:** las dependencias apuntan hacia adentro.
2. **Un solo lugar para cada dirección de la API:** `shared/src/endpoints.ts`.
3. **SQL en minúsculas** y nombres de campos idénticos al modelo aprobado (R1–R6).
4. **Un dato se llama igual** en la base, en el backend y en la web (`numero_pisos`).
5. **Cambios de esquema solo por migraciones**, nunca desde el panel de Supabase.
6. **Nunca subir claves ni archivos `.env`.**
