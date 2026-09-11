# Panamericana — Sistema de Gestión

Sistema web y móvil para venta de pasajes, gestión de flota, rutas y encomiendas de la empresa de transporte **Panamericana**.

> **Repositorio privado de trabajo (Repositorio 1).** Acceso: John Zabaleta y Ángel Paredes.
> El repositorio del equipo completo es el **Repositorio 2** (ver [REPLICACION_REPO2.md](REPLICACION_REPO2.md)).

---

## Documentación

| Documento | Contenido |
|---|---|
| [PLANIFICACION.md](PLANIFICACION.md) | Roles, stack, reglas del proyecto, sprints y roadmap |
| [ARQUITECTURA_CLEAN.md](ARQUITECTURA_CLEAN.md) | Guía práctica de Clean Architecture y convenciones de código |
| [PROPUESTA_BD.md](PROPUESTA_BD.md) | Modelo de datos (borrador v0.1, en revisión) |
| [REPLICACION_REPO2.md](REPLICACION_REPO2.md) | Cómo se crea y se sincroniza el repositorio del equipo |
| `docs/api/openapi.yaml` | Contrato de la API (se escribe antes del código) |
| `docs/adr/` | Decisiones de arquitectura |
| `docs/guias-sprint/` | Guías de replicación por sprint |

---

## Estructura

```
backend/     API REST — Node.js + TypeScript + Express (Clean Architecture)
web/         Next.js — portal público + backoffice
mobile/      Expo React Native — app de compra
supabase/    migraciones .sql y datos de prueba
docs/        contrato de API, decisiones y guías
```

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 24 LTS (ver `.nvmrc`) |
| npm | 10+ |
| Supabase CLI | última estable |
| Git | 2.40+ |

---

## Puesta en marcha

### 1. Backend

```bash
cd backend && npm install && cp .env.example .env && npm run dev
```

Completa `.env` con los datos del proyecto de Supabase de **staging**. El archivo `.env` nunca se sube al repositorio.

### 2. Contrato de la API (mock)

Levanta un servidor falso que responde según el contrato, para que el frontend avance sin esperar al backend:

```bash
npx @stoplight/prism-cli mock docs/api/openapi.yaml --port 4010
```

### 3. Web y móvil

Aún no están generados. Las instrucciones están en `web/README.md` y `mobile/README.md`.

---

## Reglas del proyecto (resumen)

1. **Clean Architecture:** las dependencias apuntan hacia adentro. Ver [ARQUITECTURA_CLEAN.md](ARQUITECTURA_CLEAN.md).
2. **API-First:** primero el endpoint en `docs/api/openapi.yaml`, después el código.
3. **SQL en minúsculas** y nombres de campos idénticos al modelo aprobado (reglas R1–R6 de [PLANIFICACION.md](PLANIFICACION.md)).
4. **Un solo nombre por dato:** el mismo en la base de datos, en las entidades y en el JSON de la API.
5. **Cambios de esquema solo por migraciones**, nunca desde el panel de Supabase.
6. **Nunca subir claves ni archivos `.env`.**
