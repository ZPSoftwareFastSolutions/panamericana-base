# Guía de Trabajo — Proyecto Panamericana (Web)

> **Versión:** 1.0 · **Para:** todo el equipo de desarrollo
> **Qué es:** el manual del día a día. Cómo levantar el proyecto, dónde va cada archivo y cómo se conecta la pantalla con la base de datos.
> Todo lo que aparece aquí **existe en el repositorio**: el módulo `buses` está implementado de punta a punta como ejemplo.

---

## 1. Qué estamos construyendo

| Parte | Tecnología | Carpeta | Puerto |
|---|---|---|---|
| **Backend** (API REST) | Node.js + TypeScript + Express | `backend/` | 4000 |
| **Frontend** (web) | Next.js 16 + React + Tailwind | `web/` | 3000 |
| **Contrato compartido** | TypeScript | `shared/` | — |
| **Base de datos** | PostgreSQL en Supabase | `supabase/` | — |

> **¿Por qué Express y no NestJS?** Porque en Express se ve *todo*: no hay decoradores ni magia. El orden lo pone la arquitectura (las 4 capas), no el framework. Con menos herramientas que aprender, el equipo se concentra en el negocio.

> **La app móvil nativa no está en este repositorio.** En el MVP el canal móvil es el mismo portal web instalable como PWA (épica E8, Sprint 3).

---

## 2. Puesta en marcha (primera vez)

### 2.1 Requisitos

| Herramienta | Versión | Verificar con |
|---|---|---|
| Node.js | 24 LTS | `node -v` |
| npm | 10+ | `npm -v` |
| Git | 2.40+ | `git --version` |

### 2.2 Instalar

Un solo `npm install` **en la raíz** instala los tres paquetes (backend, web y shared). No ejecutes `npm install` dentro de `backend/` o `web/`.

```bash
npm install
```

### 2.3 Variables de entorno

```bash
cp backend/.env.example backend/.env
```

```bash
cp web/.env.local.example web/.env.local
```

En PowerShell: `Copy-Item backend\.env.example backend\.env`

Luego completa `backend/.env` con los datos de Supabase:

| Variable | De dónde sale | Ejemplo |
|---|---|---|
| `PORT` | fijo | `4000` |
| `ALLOWED_ORIGINS` | dónde corre la web | `http://localhost:3000` |
| `DATABASE_URL` | **Session pooler** (ver aviso abajo). La contraseña la comparte Ángel por canal privado | `postgresql://postgres.tvyhpwpyxmbdfxogopnl:CONTRASENA@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `SUPABASE_URL` | Ya viene en el `.env.example` | `https://tvyhpwpyxmbdfxogopnl.supabase.co` |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT | (se usa en la épica de login) |
| `MINUTOS_RESERVA_ASIENTO` | acuerdo del equipo | `10` |

`web/.env.local` solo necesita:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> ⚠️ Los archivos `.env` y `.env.local` **nunca** se suben al repositorio. Solo se suben los `.example`.

> 🔌 **Usa siempre el Session pooler.** La conexión directa (`db.<ref>.supabase.co`) es solo IPv6 y falla en casi cualquier red doméstica con `getaddrinfo ENOTFOUND`. El pooler (`aws-0-us-east-1.pooler.supabase.com`, puerto 5432) es IPv4 y funciona; fíjate que el usuario incluye la referencia del proyecto: `postgres.tvyhpwpyxmbdfxogopnl`.

### 2.4 Levantar el proyecto (dos terminales)

```bash
npm run dev:backend
```

```bash
npm run dev:web
```

| Para ver | Abre |
|---|---|
| ¿La base conecta? | `npm run db:verificar` en una terminal |
| ¿La API responde? | http://localhost:4000/salud → `{"estado":"ok"}` |
| La web | http://localhost:3000 |
| El panel administrativo | http://localhost:3000/admin/buses |

### 2.5 Comandos que vas a usar siempre

| Comando (desde la raíz) | Qué hace |
|---|---|
| `npm run dev:backend` | Levanta la API y se recarga al guardar |
| `npm run dev:web` | Levanta la web |
| `npm test` | Ejecuta las pruebas del backend |
| `npm run lint` | Revisa el estilo del código |
| `npm run build` | Compila todo, igual que en el servidor |
| `npm run build:shared` | Recompila el contrato compartido (se ejecuta solo al usar `dev:*`) |
| `npm run db:verificar` | Comprueba que el backend se conecta a la base y lista las tablas |

---

## 3. Mapa del repositorio

```
panamericana/
├── package.json              raíz: une los 3 paquetes y define los comandos
│
├── shared/                   CONTRATO compartido entre backend y web
│   └── src/
│       ├── endpoints.ts      ← direcciones de la API (el único lugar donde se escriben)
│       ├── tipos/bus.ts      ← forma de los datos que viajan entre back y front
│       ├── tipos/comunes.ts  ← forma de los errores
│       └── index.ts          lo que el paquete expone
│
├── backend/                  API REST
│   └── src/
│       ├── modulos/
│       │   └── buses/                        ← MÓDULO DE EJEMPLO (copiar esta forma)
│       │       ├── dominio/
│       │       │   ├── Bus.ts                reglas del negocio
│       │       │   ├── BusRepositorio.ts     qué datos necesita (interfaz)
│       │       │   └── errores.ts            errores del negocio
│       │       ├── casos-de-uso/
│       │       │   ├── RegistrarBus.ts       la acción "registrar un bus"
│       │       │   ├── RegistrarBus.test.ts  su prueba (sin base de datos)
│       │       │   └── ListarBuses.ts
│       │       └── adaptadores/
│       │           ├── busRutas.ts           entrada HTTP
│       │           └── PgBusRepositorio.ts   SQL
│       ├── compartido/
│       │   ├── dominio/ErrorDeDominio.ts                 clase base de errores
│       │   └── adaptadores/http/manejadorErrores.ts      error → código HTTP
│       ├── infraestructura/
│       │   ├── config.ts        lee el .env
│       │   ├── baseDeDatos.ts   conexión a Supabase
│       │   └── servidor.ts      arma Express
│       ├── contenedor.ts        conecta las piezas (único lugar con "new")
│       ├── rutas.ts             registra los routers de cada módulo
│       └── main.ts              arranca el servidor
│
├── web/                      Next.js
│   └── src/
│       ├── app/                              RUTAS: lo que el usuario ve en la URL
│       │   ├── layout.tsx                    envoltura general
│       │   ├── proveedores.tsx               cache de datos (TanStack Query)
│       │   ├── page.tsx                      "/"
│       │   └── (backoffice)/
│       │       ├── layout.tsx                menú lateral del panel
│       │       └── admin/buses/page.tsx      "/admin/buses"
│       ├── modulos/
│       │   └── buses/                        ← MÓDULO DE EJEMPLO (copiar esta forma)
│       │       ├── componentes/              lo que se ve (tabla, formulario)
│       │       ├── hooks/                    lógica: cuándo pedir, cargando, error
│       │       └── servicios/                llamadas a la API
│       └── compartido/servicios/clienteHttp.ts   único lugar con fetch
│
├── supabase/
│   ├── migrations/           archivos .sql que crean y cambian las tablas
│   └── seed.sql              datos de prueba
│
└── docs/
    ├── api/openapi.yaml      contrato en formato estándar
    ├── adr/                  decisiones importantes y su porqué
    └── guias-sprint/         qué construir en cada sprint
```

### 3.1 ¿Dónde trabajo yo?

| Persona | Carpetas |
|---|---|
| **Brisa** (frontend backoffice) | `web/src/app/(backoffice)/` y `web/src/modulos/<modulo>/componentes` |
| **Karime** (frontend cliente) | `web/src/app/(publico)/` *(se crea en su épica)* y sus módulos |
| **Grisel** (back + front) | `backend/src/modulos/<sus modulos>/` y `web/src/modulos/<sus modulos>/` |
| **John** y **Ángel** (backend) | `backend/src/modulos/<sus modulos>/` y `supabase/migrations/` |
| **Todos** | `shared/src/` al agregar un endpoint nuevo (siempre en PR) |

---

## 4. El flujo completo: del botón a la base de datos

```mermaid
flowchart TD
    A["1· Pantalla<br/>admin/buses/page.tsx"] --> B["2· Componente<br/>FormularioBus.tsx"]
    B --> C["3· Hook<br/>useRegistrarBus.ts"]
    C --> D["4· Servicio<br/>busesServicio.ts"]
    D --> E["5· Cliente HTTP<br/>clienteHttp.ts"]
    E -->|"POST /v1/buses"| F["6· Ruta Express<br/>busRutas.ts"]
    F --> G["7· Caso de uso<br/>RegistrarBus.ts"]
    G --> H["8· Dominio<br/>Bus.ts"]
    G --> I["9· Repositorio<br/>PgBusRepositorio.ts"]
    I -->|"insert into buses"| J[("10· Supabase")]
```

La dirección `/v1/buses` no se escribe en el paso 4 ni en el 6: **los dos la leen de `shared/src/endpoints.ts`**.

---

## 5. El paquete compartido (`shared/`)

Es lo que evita que el backend y la web se desincronicen.

### 5.1 Los endpoints se declaran una sola vez

```ts
// shared/src/endpoints.ts
export const RUTAS_API = {
  salud: '/salud',
  buses: {
    base: '/v1/buses',                                  // GET listar · POST registrar
    porId: '/v1/buses/:id',                             // formato para Express
    detalle: (id: string): string => `/v1/buses/${id}`, // formato para la web
  },
} as const;
```

| Lo usa | Así |
|---|---|
| Backend | `router.post(RUTAS_API.buses.base, ...)` |
| Web | `clienteHttp.get<Bus[]>(RUTAS_API.buses.base)` |

### 5.2 Los tipos de datos también

```ts
// shared/src/tipos/bus.ts
export type Bus = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion: number | null;
  numero_pisos: number;
  estado: EstadoBus;
};
```

Los nombres son **idénticos a los de la base de datos** (`numero_pisos`, no `numeroPisos`). Así un dato se llama igual en la tabla, en el backend, en el JSON y en la pantalla. Es la regla **R2**.

### 5.3 Regla de uso

| ✅ Puede importar `@panamericana/shared` | ❌ No debe |
|---|---|
| `backend/src/modulos/*/adaptadores/` | `backend/src/modulos/*/dominio/` |
| Toda la carpeta `web/src/` | `backend/src/modulos/*/casos-de-uso/` |

El dominio define sus propios tipos: es el corazón del negocio y no depende de cómo viajan los datos por internet.

---

## 6. Las 4 capas del backend

| Capa | Pregunta que responde | Ejemplo |
|---|---|---|
| **1. dominio** | ¿Cuál es la regla del negocio? | "un bus tiene 1 o 2 pisos" |
| **2. casos-de-uso** | ¿Qué acción hace el usuario y en qué pasos? | "verificar placa → crear → guardar" |
| **3. adaptadores** | ¿Cómo entra la petición y cómo se guarda? | Express y SQL |
| **4. infraestructura** | ¿Cómo arranca y se conecta todo? | servidor, conexión, `.env` |

### Regla de oro

> Los `import` solo apuntan **hacia adentro**: `infraestructura → adaptadores → casos-de-uso → dominio`

| ✅ Permitido | ❌ Prohibido |
|---|---|
| `RegistrarBus.ts` importa `Bus` | `Bus.ts` importa `pg` o `express` |
| `PgBusRepositorio.ts` implementa `BusRepositorio` | `RegistrarBus.ts` recibe `req` o `res` |
| `busRutas.ts` importa `RegistrarBus` | `RegistrarBus.ts` escribe SQL |

### ¿Cómo guarda datos el caso de uso sin tocar la base?

Con una interfaz, el "enchufe":

1. El dominio dice **qué** necesita → `BusRepositorio` con `guardar(bus)`.
2. El adaptador dice **cómo** se hace → `PgBusRepositorio` con SQL.
3. `contenedor.ts` los conecta.

Gracias a eso, la prueba de `RegistrarBus` corre **sin base de datos y sin internet**: se le pasa un repositorio falso que guarda en memoria.

---

## 7. Ejemplo real: el módulo `buses`, archivo por archivo

### Backend

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `dominio/errores.ts` | Define `PlacaDuplicadaError` (409), `PlacaInvalidaError` (400)… Cada error sabe su código HTTP |
| 2 | `dominio/Bus.ts` | `Bus.crear()` aplica las reglas; `Bus.reconstruir()` arma un bus que ya existía en la base |
| 3 | `dominio/BusRepositorio.ts` | La interfaz: `listar`, `existePlaca`, `guardar` |
| 4 | `casos-de-uso/RegistrarBus.ts` | Los pasos de la acción |
| 5 | `casos-de-uso/RegistrarBus.test.ts` | 3 pruebas con repositorio en memoria |
| 6 | `adaptadores/PgBusRepositorio.ts` | El SQL real |
| 7 | `adaptadores/busRutas.ts` | `GET` y `POST`, y la validación del JSON con Zod |

```ts
// casos-de-uso/RegistrarBus.ts — así de corto debe verse un caso de uso
export class RegistrarBus {
  constructor(private readonly buses: BusRepositorio) {}

  async ejecutar(entrada: DatosNuevoBus): Promise<Bus> {
    const bus = Bus.crear(entrada);                       // 1. reglas del negocio
    if (await this.buses.existePlaca(bus.placa)) {        // 2. regla que necesita datos
      throw new PlacaDuplicadaError(bus.placa);
    }
    await this.buses.guardar(bus);                        // 3. guardar
    return bus;
  }
}
```

```ts
// adaptadores/busRutas.ts — Zod valida la FORMA; el dominio valida el NEGOCIO
router.post(RUTAS_API.buses.base, async (req, res) => {
  const entrada = esquemaRegistrarBus.parse(req.body);
  const bus = await casos.registrarBus.ejecutar(entrada);
  res.status(201).json(bus);
});
```

No se usa `try/catch`: el error viaja solo hasta `manejadorErrores.ts`, que lo traduce (`PlacaDuplicadaError` → 409, error de Zod → 400, lo demás → 500).

### Frontend

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `servicios/busesServicio.ts` | Dice qué endpoint llamar. **Nunca** escribe la URL a mano |
| 2 | `hooks/useBuses.ts` | Trae la lista y entrega `isPending` y `error` |
| 3 | `hooks/useRegistrarBus.ts` | Registra y **refresca la lista sola** al terminar |
| 4 | `componentes/TablaBuses.tsx` | Muestra la tabla |
| 5 | `componentes/FormularioBus.tsx` | Captura los datos y muestra el error de la API |
| 6 | `app/(backoffice)/admin/buses/page.tsx` | Solo arma la pantalla con esos dos componentes |

```ts
// servicios/busesServicio.ts
export const busesServicio = {
  listar: () => clienteHttp.get<Bus[]>(RUTAS_API.buses.base),
  registrar: (datos: RegistrarBusEntrada) => clienteHttp.post<Bus>(RUTAS_API.buses.base, datos),
};
```

```ts
// hooks/useRegistrarBus.ts — al guardar, invalida la lista y la tabla se actualiza sola
return useMutation({
  mutationFn: busesServicio.registrar,
  onSuccess: () => clienteQuery.invalidateQueries({ queryKey: clavesBuses.todos }),
});
```

```tsx
// componentes/TablaBuses.tsx — los 3 estados que SIEMPRE hay que manejar
if (isPending) return <p>Cargando buses...</p>;
if (error) return <p>No se pudo cargar la lista: {error.message}</p>;
if (buses.length === 0) return <p>Todavia no hay buses registrados.</p>;
```

> Los componentes que usan hooks llevan `'use client'` en la primera línea. Las páginas (`page.tsx`) normalmente no lo necesitan.

---

## 8. Receta: agregar una funcionalidad nueva

Ejemplo: "registrar terminales". Cada paso puede ser un commit.

| # | Paso | Archivo |
|---|---|---|
| 1 | Confirmar tabla y campos en el modelo aprobado | `PROPUESTA_BD.md` |
| 2 | Crear la migración | `supabase/migrations/000X_terminales.sql` |
| 3 | Declarar el endpoint y los tipos | `shared/src/endpoints.ts`, `shared/src/tipos/terminal.ts` |
| 4 | Documentar el endpoint | `docs/api/openapi.yaml` |
| 5 | Dominio: entidad, errores e interfaz | `backend/src/modulos/terminales/dominio/` |
| 6 | Caso de uso + prueba | `backend/src/modulos/terminales/casos-de-uso/` |
| 7 | Repositorio con SQL | `backend/src/modulos/terminales/adaptadores/PgTerminalRepositorio.ts` |
| 8 | Rutas HTTP + Zod | `backend/src/modulos/terminales/adaptadores/terminalRutas.ts` |
| 9 | Conectar | `backend/src/contenedor.ts` y `backend/src/rutas.ts` |
| 10 | Probar la API | `curl http://localhost:4000/v1/terminales` |
| 11 | Servicio en la web | `web/src/modulos/terminales/servicios/` |
| 12 | Hooks | `web/src/modulos/terminales/hooks/` |
| 13 | Componentes y página | `web/src/modulos/terminales/componentes/` y `web/src/app/(backoffice)/admin/terminales/page.tsx` |
| 14 | Agregar la opción al menú | `web/src/app/(backoffice)/layout.tsx` |

**Truco:** copia la carpeta `buses` (en el backend y en la web), renombra y ajusta. Es la forma más rápida de no equivocarse.

---

## 9. Cómo hablar con la base de datos

Solo los archivos `Pg<Entidad>Repositorio.ts` tienen SQL.

### 9.1 Consultas con parámetros

```ts
// correcto: los datos van en el arreglo, nunca pegados al texto
await this.db.query('select 1 from buses where placa = $1', [placa]);
```

Pegar el valor dentro del texto de la consulta permite inyección de SQL. Siempre `$1`, `$2`, …

### 9.2 Reglas del SQL

| Regla | Ejemplo |
|---|---|
| Palabras SQL **en minúsculas** (R1) | `select`, `insert into`, `not null` |
| Nombres de campos idénticos al modelo (R2) | `numero_pisos` |
| Un `select` nombra las columnas, nunca `select *` | `select id, placa, marca ...` |
| Los montos (`numeric`) llegan como texto | `Number(fila.precio)` en el mapper |

### 9.3 Transacciones (varios pasos que deben ir juntos)

```ts
const conexion = await this.db.connect();
try {
  await conexion.query('begin');
  // ... varias consultas, por ejemplo el bloqueo de asiento del ADR-001
  await conexion.query('commit');
} catch (error) {
  await conexion.query('rollback');
  throw error;
} finally {
  conexion.release();
}
```

### 9.4 Migraciones

```bash
npx supabase migration new nombre_descriptivo
```

```bash
npx supabase db push
```

- Un cambio de esquema **siempre** es una migración; nunca se crea ni edita una tabla desde el panel de Supabase.
- Las migraciones son **solo hacia adelante**: si algo salió mal, se crea otra que lo corrige.
- Toda tabla nueva termina con `alter table <tabla> enable row level security;` (ADR-003).

---

## 10. ¿Dónde pongo este código?

| Si el código… | Va en |
|---|---|
| Valida una regla del negocio | `backend/.../dominio/<Entidad>.ts` |
| Define un error del negocio | `backend/.../dominio/errores.ts` |
| Dice qué datos hacen falta | `backend/.../dominio/<Entidad>Repositorio.ts` |
| Coordina pasos de una acción | `backend/.../casos-de-uso/` |
| Lee `req.body` o responde JSON | `backend/.../adaptadores/<entidad>Rutas.ts` |
| Escribe SQL | `backend/.../adaptadores/Pg<Entidad>Repositorio.ts` |
| Usa `new` para unir piezas | `backend/src/contenedor.ts` |
| Registra un router | `backend/src/rutas.ts` |
| Es la dirección de un endpoint | `shared/src/endpoints.ts` |
| Es la forma de un dato que viaja | `shared/src/tipos/` |
| Llama a la API | `web/src/modulos/<modulo>/servicios/` |
| Decide cuándo pedir datos, o maneja "cargando" | `web/src/modulos/<modulo>/hooks/` |
| Se ve en pantalla | `web/src/modulos/<modulo>/componentes/` |
| Es una URL que el usuario escribe | `web/src/app/.../page.tsx` |

---

## 11. Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas | kebab-case en español | `casos-de-uso/` |
| Entidades y casos de uso | PascalCase; caso de uso = verbo | `Bus`, `RegistrarBus` |
| Interfaz de repositorio | `<Entidad>Repositorio` | `BusRepositorio` |
| Implementación | `Pg<Entidad>Repositorio` | `PgBusRepositorio` |
| Errores | `<Descripción>Error` | `PlacaDuplicadaError` |
| Archivos de clase | igual que la clase | `RegistrarBus.ts` |
| Otros archivos | camelCase | `busRutas.ts`, `busesServicio.ts` |
| **Campos de datos** | **snake_case, igual que la base** | `numero_pisos` |
| Servicios (web) | `<modulo>Servicio` | `busesServicio` |
| Hooks | `use` + PascalCase | `useRegistrarBus` |
| Componentes | PascalCase | `FormularioBus.tsx` |
| Endpoints | `/v1/<recurso-en-plural>` | `/v1/buses` |
| Código de error de la API | snake_case | `placa_duplicada` |

---

## 12. Errores comunes

| ❌ Error | Por qué está mal | ✅ En su lugar |
|---|---|---|
| `fetch` dentro de un componente | No se puede reutilizar ni probar | Servicio + hook |
| Escribir `'/v1/buses'` a mano en la web | Si cambia la ruta, algo se rompe en silencio | `RUTAS_API.buses.base` |
| SQL dentro de `busRutas.ts` | Mezcla HTTP con base de datos | Moverlo al repositorio |
| `import { Pool } from 'pg'` en `dominio/` | Ata el negocio a la base de datos | Usar la interfaz |
| El caso de uso recibe `req` | Lo ata a Express | Recibir un objeto simple |
| Renombrar `numero_pisos` a `numeroPisos` | Rompe R2 y confunde entre capas | Mismo nombre en todas partes |
| `npm install` dentro de `backend/` | Rompe la instalación por workspaces | `npm install` en la raíz |
| Crear una tabla desde el panel de Supabase | Los entornos quedan distintos | Una migración |
| Subir el archivo `.env` | Se filtran las claves | Solo el `.env.example` |

---

## 13. Antes de abrir un Pull Request

- [ ] `npm run lint` sin errores
- [ ] `npm test` en verde
- [ ] `npm run build` compila
- [ ] El endpoint está en `shared/src/endpoints.ts` y en `docs/api/openapi.yaml`
- [ ] SQL en minúsculas y nombres de campos sin cambios
- [ ] No hay archivos `.env` ni claves en el cambio
- [ ] La pantalla maneja cargando, error y lista vacía

---

## 14. Qué dejamos fuera por ahora

| Tema | Cuándo entra |
|---|---|
| App móvil nativa (React Native) | Fuera del MVP; el canal móvil es una PWA (E8, Sprint 3) |
| Login y roles (Supabase Auth) | Épica E1, Sprint 2 |
| Portal público de compra `app/(publico)/` | Maqueta en el Sprint 1; compra real en la épica E5, Sprint 2 |
| Pruebas de humo en staging | Épica E10, Sprint 3 |
| Validación automática de capas y del SQL | *Could*, fuera del compromiso del MVP |
| Componentes de UI compartidos | Cuando el mismo componente se repita 3 veces |

Sprints y tarjetas: `PRODUCT_BACKLOG.md`.
