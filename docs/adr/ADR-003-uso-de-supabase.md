# ADR-003 — Cómo usamos Supabase

- **Fecha:** 2026-09-11 · **Actualizada:** 2026-09-12 (proyecto creado y compartido)
- **Estado:** Aceptada
- **Responsable:** John Zabaleta

## Contexto

Supabase ofrece PostgreSQL gestionado, autenticación y una API automática sobre las tablas. Esa API automática, si se deja abierta, permitiría que cualquiera con la clave pública lea o escriba tablas directamente, saltándose las reglas del negocio.

## Decisión

| Regla | Detalle |
|---|---|
| Supabase es **PostgreSQL + autenticación**, no el backend | Toda la lógica vive en nuestra API |
| Los datos se leen y escriben **solo por la API** | Web y móvil usan `supabase-js` únicamente para iniciar sesión y obtener el token |
| **RLS activado** en todas las tablas de `public`, sin políticas para `anon` ni `authenticated` | La API automática de Supabase no expone datos |
| El backend se conecta con la cadena de conexión de PostgreSQL (modo sesión) | Permite transacciones reales, necesarias para ADR-001 |
| La `service_role key` y la contraseña de la base de datos solo existen en el backend | Nunca en web, móvil ni en el repositorio |
| Un solo proyecto de desarrollo: **`panamericana`** (ref `tvyhpwpyxmbdfxogopnl`) | Lo comparten el Repositorio 1 y el Repositorio 2, para que el equipo trabaje sobre los mismos datos. El proyecto de produccion se crea antes de la entrega final |
| Los cambios de esquema se hacen **solo por migraciones** | Prohibido crear o editar tablas desde el panel |

## Base de datos creada

| Dato | Valor |
|---|---|
| Proyecto | `panamericana` |
| Referencia | `tvyhpwpyxmbdfxogopnl` |
| URL | `https://tvyhpwpyxmbdfxogopnl.supabase.co` |
| Region | `us-east-1` |
| Tablas | 16, todas con RLS activado y sin politicas publicas |

**Riesgo asumido al compartir el proyecto entre los dos repositorios:** cualquiera de los dos equipos puede borrar o modificar datos del otro. Por eso el Repositorio 1 no hace cargas masivas de datos: el espacio es del equipo de 5 para sus pruebas de CRUD. Si hiciera falta aislar, se crea un segundo proyecto y solo cambia `DATABASE_URL`.

## Consecuencias

- El backend valida el token de Supabase Auth en cada petición (`compartido/adaptadores/http/autenticacion.ts`).
- Si más adelante se quiere usar Realtime para el croquis de asientos, hará falta un nuevo ADR, porque rompe la regla de "datos solo por la API".
- Las claves y la contrasena de la base nunca viajan por el repositorio: cada persona las copia del panel de Supabase.
- Cuando se cree el proyecto de produccion, solo cambia `DATABASE_URL`; el codigo no se toca.
