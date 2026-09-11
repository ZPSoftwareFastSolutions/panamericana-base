# Web — Next.js

Todavía no está generada. Se crea en el Sprint 0.

## 1. Generar el proyecto

Desde la raíz del repositorio:

```bash
npx create-next-app@latest web --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack
```

Si la herramienta pregunta por sobrescribir esta carpeta, acepta: este README se puede volver a crear después.

## 2. Dependencias adicionales

```bash
cd web && npm install @tanstack/react-query @supabase/supabase-js
```

## 3. Estructura que se debe crear dentro de `web/src`

```
app/
├── (publico)/          portal de compra          → Karime
│   ├── page.tsx
│   └── viajes/[id]/page.tsx
└── (backoffice)/       panel administrativo      → Brisa (layout) + Grisel (sus módulos)
    ├── layout.tsx
    └── admin/

modulos/
└── <modulo>/
    ├── componentes/    solo interfaz
    ├── hooks/          lógica y estados de carga
    ├── api/            llamadas al backend
    └── tipos.ts        tipos iguales al contrato (snake_case)

compartido/
├── componentes/        Boton, Modal, Tabla
└── api/clienteHttp.ts  fetch base + token de sesión
```

Reglas: los componentes **nunca** llaman a `fetch`; solo los archivos de `api/` hablan con el backend.
Ver `ARQUITECTURA_CLEAN.md`, sección 7.

## 4. Variables de entorno

Crear `web/.env.local` (nunca se sube):

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> La `service_role key` de Supabase **jamás** se usa en la web ni en el móvil.
