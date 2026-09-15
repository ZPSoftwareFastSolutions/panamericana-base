# Panamericana

Sistema web de gestión para una empresa de transporte: venta de pasajes, flota de buses, rutas, viajes y encomiendas.

Proyecto del curso Proyecto III.

## Tecnologías

- **Backend:** Node.js, TypeScript, Express
- **Frontend:** Next.js, React, Tailwind CSS
- **Base de datos:** PostgreSQL (Supabase)

## Requisitos

- Node.js 24
- npm 10 o superior

## Instalación

1. Clonar el repositorio.
2. Instalar las dependencias desde la raíz del proyecto:

   ```bash
   npm install
   ```

3. Crear los archivos de entorno:

   ```bash
   cp backend/.env.example backend/.env
   cp web/.env.local.example web/.env.local
   ```

4. Completar `DATABASE_URL` en `backend/.env` con la cadena de conexión que comparte el equipo.

## Uso

Levantar el backend y la web en dos terminales:

```bash
npm run dev:backend
```

```bash
npm run dev:web
```

- API: http://localhost:4000
- Web: http://localhost:3000

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev:backend` | Inicia la API |
| `npm run dev:web` | Inicia la web |
| `npm test` | Ejecuta las pruebas |
| `npm run lint` | Revisa el código |
| `npm run build` | Compila el proyecto |
| `npm run db:verificar` | Prueba la conexión con la base de datos |

## Estructura

```
backend/    API REST
web/        Aplicación web
shared/     Rutas de la API y tipos compartidos
supabase/   Migraciones y datos de prueba
```

## Equipo

- Ángel Fabricio Paredes Campos
- John Martín Zabaleta Cano
- Grisel
- Brisa
- Karime
