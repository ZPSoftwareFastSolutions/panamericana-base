# ADR-003 — Cómo usamos Supabase

- **Fecha:** 2026-09-11
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
| Dos proyectos: `panamericana-staging` y `panamericana-prod` | Nunca se desarrolla contra producción |
| Los cambios de esquema se hacen **solo por migraciones** | Prohibido crear o editar tablas desde el panel |

## Consecuencias

- El backend valida el token de Supabase Auth en cada petición (`compartido/adaptadores/http/autenticacion.ts`).
- Si más adelante se quiere usar Realtime para el croquis de asientos, hará falta un nuevo ADR, porque rompe la regla de "datos solo por la API".
- Cada entorno tiene sus propias claves; nunca se comparten entre entornos ni entre repositorios.
