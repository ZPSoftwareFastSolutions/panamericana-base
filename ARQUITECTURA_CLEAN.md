# Guía de Trabajo — Proyecto Panamericana (Web)

> **Versión:** 1.1 (26/09: accesibilidad, textos legales y tarifas de ley) · **Para:** todo el equipo de desarrollo
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
| `MINUTOS_RESERVA_ASIENTO` | acuerdo del equipo | `10` |
| `LIMITE_RESERVAS_POR_HORA` | protección del portal: reservas por conexión y hora | `30` |

`web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://tvyhpwpyxmbdfxogopnl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…   (viene en el .example; es pública por diseño)
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
| El panel administrativo | http://localhost:3000/admin → pide iniciar sesión (cuentas de prueba de Ana y Luis; la contraseña la comparte Ángel) |
| El portal de compra | http://localhost:3000 → buscar *Oruro → Cochabamba* |

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
| `npm run db:semilla` | Vuelve a cargar los datos de prueba (idempotente) |
| `npm run db:demo` | Crea los viajes de demostración de hoy a 6 días (idempotente) |
| `npm run ml:entrenar` | Reentrena el modelo de demanda y escribe sus coeficientes en `modelo-demanda.json` |
| `npm run test:integracion` | Pruebas contra la base real (`*.integracion.test.ts`, no las corre la CI) |
| `npm run prueba:humo` | Recorre la API sin escribir datos (con `API_URL` sirve contra staging) |
| `npm run prueba:seguridad` | RLS, políticas, vistas, CORS, secretos y rutas cerradas |

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
│       ├── negocio.ts        ← razón social, NIT y contacto de la empresa (el único lugar donde se escriben)
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
│       ├── compartido/                 NÚCLEO: lo que usan varios módulos
│       │   ├── dominio/
│       │   │   ├── ErrorDeDominio.ts       clase base de errores
│       │   │   ├── erroresComunes.ts       DatoObligatorioError
│       │   │   ├── Persona.ts              reglas bolivianas de una persona (CI, celular, correo)
│       │   │   ├── erroresPersona.ts       errores de los datos personales
│       │   │   ├── Tramo.ts                tramo de un viaje: paradas, hora de paso, precio (Bs 0,50) y tarifas de ley
│       │   │   ├── erroresViaje.ts         viaje inexistente, no disponible, tramo inválido
│       │   │   └── Codigo.ts               códigos V-/P- y documentos ocultos
│       │   └── adaptadores/
│       │       ├── http/                      manejadorErrores.ts · autorizacion.ts (roles) · limiteDePeticiones.ts
│       │       └── pg/                        transaccion.ts · personasSql.ts (guardarPersona, guardarCliente) · erroresPg.ts · reservasSql.ts
│       ├── infraestructura/
│       │   ├── config.ts        lee el .env
│       │   ├── baseDeDatos.ts   conexión a Supabase
│       │   ├── reloj.ts         "hoy" en La Paz
│       │   ├── ejecutarSql.ts   npm run db:semilla / db:demo
│       │   └── servidor.ts      arma Express
│       ├── contenedor.ts        conecta las piezas (único lugar con "new")
│       ├── rutas.ts             registra los routers de cada módulo
│       └── main.ts              arranca el servidor
│
├── web/                      Next.js
│   └── src/
│       ├── app/                              RUTAS: lo que el usuario ve en la URL
│       │   ├── layout.tsx                    envoltura general: idioma, títulos, "Saltar al contenido"
│       │   ├── proveedores.tsx               cache de datos (TanStack Query)
│       │   ├── robots.ts · sitemap.ts        buscadores (cerrados hasta tener dominio oficial)
│       │   ├── (publico)/                    portal: "/", login, viajes, viajes/[id], compra/[codigo], boleto, seguimiento,
│       │   │                                 terminos, privacidad, reembolsos, cookies
│       │   └── (backoffice)/
│       │       ├── layout.tsx                PanelConSesion: exige sesión y arma el menú por rol
│       │       └── admin/                    page.tsx (inicio) y {buses,terminales,clientes,rutas,viajes}/page.tsx
│       ├── modulos/
│       │   ├── buses/                        ← MÓDULO DE EJEMPLO (copiar esta forma)
│       │   │   ├── componentes/              lo que se ve (tabla, formulario)
│       │   │   ├── hooks/                    lógica: cuándo pedir, cargando, error
│       │   │   └── servicios/                llamadas a la API
│       │   └── legal/                        documentos legales (solo componentes: no llaman a la API)
│       └── compartido/
│           ├── servicios/clienteHttp.ts      único lugar con fetch
│           ├── sitio.ts                      dominio oficial (NEXT_PUBLIC_SITIO_URL)
│           ├── componentes/                  Boton, Campo, CampoSeleccion, CampoCasilla, DatoDelNegocio, MenuLateral, PlanoAsientos,
│           │                                 GraficoBarras, CuentaRegresiva, CodigoQR, ConsultaPorCodigo
│           └── utilidades/                   fechas.ts (hora de La Paz) · dinero.ts (formatearBs)
│
├── supabase/
│   ├── migrations/           archivos .sql que crean y cambian las tablas
│   ├── seed.sql              datos de prueba
│   └── demo.sql              viajes de demostración de la semana
│
└── docs/
    ├── api/openapi.yaml      referencia interna del módulo buses (no se mantiene; el contrato es shared/src)
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
| 4 | Revisar que el contrato quedó completo (rutas y tipos) | `shared/src/` |
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

Se usa `enTransaccion` del núcleo compartido (`compartido/adaptadores/pg/transaccion.ts`), que hace `begin`, `commit` o `rollback` y libera la conexión:

```ts
await enTransaccion(this.db, async (conexion) => {
  // turno: otra transaccion que bloquee el mismo viaje espera aqui
  await conexion.query('select id from viajes where id = $1 for update', [viaje_id]);
  // ... volver a revisar y escribir (ADR-001)
});
```

**Cuando dos personas pueden chocar** (el mismo asiento, el mismo bus, el mismo nombre), la regla se revisa **dos veces**: antes, para dar un mensaje claro, y **dentro** de la transacción con la fila bloqueada o con una restricción de la base (`pasajes_asiento_sin_traslape`, `rutas_nombre_unico`) que el repositorio traduce a un error de dominio (409).

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

**Reglas del modelo v2.0 (normalizado hasta 5FN, ver `PROPUESTA_BD.md`):**

- **Un dato que se puede calcular no se guarda.** Si sale de otras filas (un total, una duración, un estado que ya está en un historial), va en una **vista**, no en una columna.
- **Un dato de una persona se guarda una sola vez**, en `personas`. `usuarios`, `clientes` y `choferes` son roles que la enlazan con `persona_id`.
- **Las listas de valores compartidas son catálogos** (`tipos_documento`, `tipos_asiento`, `roles`, `metodos_pago`, …) con el código legible como clave primaria; el JSON de la API sigue mostrando `'ci'` o `'cama'`. Los **estados** de una máquina de estados se quedan como `check`.
- **Una persona en la API:** los roles de una persona (cliente, usuario, chofer) se devuelven **aplanados**, con los campos de `personas` al mismo nivel (`{ id, tipo_documento, numero_documento, nombres, … }`). Una **referencia** a otra entidad se devuelve como **objeto anidado** con el nombre de la entidad en singular (`terminal.ciudad = { id, nombre, departamento }`).
- **Reutilizar el núcleo:** las reglas de una persona se validan con `crearPersona` (`compartido/dominio/Persona.ts`) y se guardan con `guardarPersona` dentro de `enTransaccion`; nunca se copian en cada módulo.
- **Las tablas puente usan clave natural**: `rutas_paradas (ruta_id, orden)`, `viajes_choferes (viaje_id, chofer_id)`, `tarifas (viaje_id, tipo_asiento)`.
- Las **copias** solo se permiten si la base puede verificarlas con una clave foránea compuesta (el caso de `pasajes`, ADR-001).

### 9.5 Sesión y roles (desde el Sprint 2)

- El panel usa **Supabase Auth**. La web inicia sesión con `@supabase/supabase-js` y `clienteHttp` envía `Authorization: Bearer <token>` en cada petición.
- La API valida el token con el **JWKS** del proyecto (ES256, audiencia `authenticated`) en `modulos/sesion` y carga los roles de `usuarios_roles`. El id del token es el id de `usuarios`.
- Cada router del panel recibe `(casos, autorizacion)` y protege cada endpoint con un grupo de `compartido/adaptadores/http/autorizacion.ts`:

| Grupo | Roles | Para |
|---|---|---|
| `ROLES_INTERNOS` | administrador, vendedor, encomiendas | Consultar (listas, detalle) |
| `SOLO_ADMINISTRADOR` | administrador | Configurar: buses, croquis, terminales, rutas, viajes, usuarios |
| `ROLES_VENTA` | administrador, vendedor | Taquilla y anulaciones |
| `ROLES_ENCOMIENDAS` | administrador, encomiendas | Encomiendas |

- **Públicos** (sin sesión): catálogos, búsqueda de viajes, asientos del tramo y la compra del portal (con límite de reservas por conexión).
- El menú de la web (`MenuLateral`, arreglo `OPCIONES` con roles) **solo oculta** opciones; la protección real es la API.

### 9.7 Machine learning sin romper las capas (desde el incremento 4)

- El modelo se **entrena fuera de la API** (`modulos/prediccion/entrenamiento/`, `npm run ml:entrenar`) y se guarda como coeficientes en un JSON junto al adaptador que lo lee.
- Lo que describe un día (`Caracteristicas.ts`, feriados de Bolivia) vive en el **dominio**: entrenar y predecir usan el mismo código. `exigirModeloCompatible` rechaza un JSON viejo.
- El caso de uso solo multiplica y suma; la base de la ruta sale de las ventas reales cuando hay suficientes y, si no, del modelo. Los datos de entrenamiento sintéticos se **declaran** en la respuesta.

### 9.6 Una regla, un lugar (desde el Sprint 3)

- **Un canal nuevo reutiliza los casos de uso existentes.** La taquilla (`VenderEnTaquilla`) compone `ReservarAsientos` y `PagarVenta`: así la web y la taquilla comparten el inventario y las defensas contra la doble venta.
- **La web no copia reglas del backend.** Si la pantalla necesita saber qué se puede hacer, la API lo informa (por ejemplo `encomienda.siguientes`, o `precios_por_tarifa` en la disponibilidad para mostrar el total con descuento) o lo lee de un catálogo (`/v1/catalogos/tipos-asiento`).
- **Todo movimiento de dinero queda en `pagos`** (`aprobado` al cobrar, `reembolsado` al devolver), en la misma transacción que el cambio de estado.
- **Orden de bloqueos:** cuando una transacción bloquea varias filas, lo hace siempre en el mismo orden (venta → pasajes; bus → viajes) para no trabarse con otra.

### 9.8 Accesibilidad, datos personales y textos legales (desde el incremento de calidad)

- **Formularios:** siempre con `Campo`, `CampoSeleccion` o `CampoCasilla` (etiqueta visible, ayuda y error enlazados). Nunca un `<input>` suelto con solo `placeholder`.
- **Textos visibles en español correcto** (con tildes); los identificadores y comentarios siguen sin tildes.
- **Contraste:** texto con `slate-500` o más oscuro sobre blanco (`slate-400` no alcanza 4,5:1); gráficos y bordes de campos 3:1. El foco lo dibuja `globals.css`: no usar `focus:outline-none`.
- **Íconos y flechas decorativas** con `aria-hidden`; si dicen algo, un texto `sr-only` al lado. Un `sr-only` dentro de una tabla con desplazamiento necesita un contenedor `relative`.
- **Celular:** grillas con `grid-cols-1` y columnas `minmax(0,1fr)`; tablas dentro de `relative overflow-x-auto`. Áreas táctiles de 44 px (`min-h-11`).
- **Datos personales:** pedir solo lo que el sistema usa; si un formulario recoge datos de personas, lleva la casilla de aceptación o de información (Términos y Privacidad). Las reservas exigen `acepta_condiciones: true`.
- **Sin analíticas ni scripts de terceros** sin consentimiento previo y sin actualizar la Política de Cookies (`npm run prueba:seguridad` lo revisa).
- **Datos de la empresa** solo en `shared/src/negocio.ts` y se muestran con `DatoDelNegocio`.
- **Página nueva:** `metadata` con `title`; si muestra datos personales, `robots: { index: false, follow: false }`.
- **Imágenes:** propias o con licencia verificada (el favicon de la plantilla de Next.js era el logo de un tercero y se reemplazó).

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
| Es un dato de la empresa (razón social, NIT, contacto) | `shared/src/negocio.ts` |
| Es un texto legal | `web/src/modulos/legal/componentes/` y su página en `web/src/app/(publico)/` |

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
- [ ] El endpoint y sus tipos están en `shared/src/`
- [ ] SQL en minúsculas y nombres de campos sin cambios
- [ ] No hay archivos `.env` ni claves en el cambio
- [ ] La pantalla maneja cargando, error y lista vacía
- [ ] Campos con `Campo`/`CampoSeleccion`/`CampoCasilla`, textos con tildes y sin desplazamiento horizontal a 375 px
- [ ] Si pide datos personales: solo los necesarios y con la casilla de aceptación

---

## 14. Qué dejamos fuera por ahora

| Tema | Cuándo entra |
|---|---|
| App móvil nativa (React Native) | Fuera del MVP; el canal móvil es una PWA (E8, Sprint 3) |
| Pruebas de humo en staging | Épica E10, Sprint 3 |
| Validación automática de capas y del SQL | *Could*, fuera del compromiso del MVP |
| Componentes de UI compartidos | Cuando el mismo componente se repita 3 veces |

Sprints y tarjetas: `PRODUCT_BACKLOG.md`.
