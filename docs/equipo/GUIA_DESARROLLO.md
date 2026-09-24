# Guía de Desarrollo — Panamericana

> **Para:** todo el equipo · **Versión:** 1.5 · **Fecha:** 24/09/2026 (cierre del MVP: panel, predicción, PWA y pruebas)
> **Objetivo:** que cualquier integrante pueda agregar endpoints, pantallas y módulos **sin romper la arquitectura**, por su cuenta o con ayuda de un asistente de IA.
> **Ejemplo que se usa en toda la guía:** el módulo **`choferes`** completo (listar con filtro, ver detalle, registrar y actualizar). Todo el código de esta guía **compila y funciona** con el proyecto actual.

---

## Índice

1. [Levantar el proyecto (con el `.env` oficial)](#1-levantar-el-proyecto)
2. [Cómo está organizado el proyecto](#2-cómo-está-organizado-el-proyecto)
3. [El recorrido de una petición](#3-el-recorrido-de-una-petición)
4. [Ejemplo completo: módulo `choferes`, paso a paso](#4-ejemplo-completo-módulo-choferes-paso-a-paso)
5. [Recetas cortas](#5-recetas-cortas)
6. [Reglas que no se rompen](#6-reglas-que-no-se-rompen)
7. [Cómo entregar tu tarjeta](#7-cómo-entregar-tu-tarjeta)
8. [Si usas un asistente de IA](#8-si-usas-un-asistente-de-ia)
9. [Problemas comunes](#9-problemas-comunes)
10. [Chuleta de comandos](#10-chuleta-de-comandos)

---

## 1. Levantar el proyecto

### 1.1 Requisitos

| Herramienta | Versión | Verificar |
|---|---|---|
| Node.js | 24 LTS | `node -v` |
| npm | 10 o superior | `npm -v` |
| Git | 2.40 o superior | `git --version` |

### 1.2 Instalar

```bash
git clone https://github.com/AngelParedesH20/panamericana.git
```

```bash
cd panamericana
```

```bash
npm install
```

> ⚠️ `npm install` **siempre en la raíz**. Nunca dentro de `backend/`, `web/` o `shared/`.

### 1.3 Archivos `.env` oficiales

> 🔒 **Estos valores son privados.** Nunca subas `.env` ni `.env.local` al repositorio, ni los pegues en chats públicos. Git ya los ignora.

**Archivo `backend/.env`** (créalo y pega esto tal cual):

```env
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
SUPABASE_URL=https://tvyhpwpyxmbdfxogopnl.supabase.co
DATABASE_URL=postgresql://postgres.tvyhpwpyxmbdfxogopnl:<CONTRASEÑA_DE_LA_BASE>@aws-0-us-east-1.pooler.supabase.com:5432/postgres
MINUTOS_RESERVA_ASIENTO=10
LIMITE_RESERVAS_POR_HORA=30
```

**Archivo `web/.env.local`**:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://tvyhpwpyxmbdfxogopnl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi
```

Si en `DATABASE_URL` ves `<CONTRASEÑA_DE_LA_BASE>`, pídele la contraseña a Ángel por privado.

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto de la API (4000) |
| `ALLOWED_ORIGINS` | Desde dónde puede llamar el navegador a la API (la web, en el 3000) |
| `SUPABASE_URL` | Dirección del proyecto de base de datos y login |
| `DATABASE_URL` | Conexión a PostgreSQL. **Usa el pooler** (`aws-0-us-east-1.pooler.supabase.com`); la conexión directa `db.…supabase.co` falla con `ENOTFOUND` |
| `MINUTOS_RESERVA_ASIENTO` | Minutos que se retiene un asiento mientras se paga |
| `LIMITE_RESERVAS_POR_HORA` | Reservas del portal que puede hacer una misma conexión por hora (evita que alguien acapare asientos). Para pruebas locales intensivas puedes subirlo |
| `NEXT_PUBLIC_API_URL` | Dirección de la API que usa la web |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Inicio de sesión del panel. La clave *publicable* está hecha para el navegador: no es secreta |

> 🧪 **La base de datos es compartida por todo el equipo.** Puedes crear datos de prueba, pero **borra lo que crees** al terminar y no hagas cargas masivas.

### 1.4 Verificar y arrancar

```bash
npm run db:verificar
```

Debe decir `Conexion correcta` y listar **26 tablas** y **4 vistas**.

En **dos terminales**:

```bash
npm run dev:backend
```

```bash
npm run dev:web
```

| Abre | Debes ver |
|---|---|
| http://localhost:4000/salud | `{"estado":"ok"}` |
| http://localhost:4000/v1/catalogos/ciudades | Las ciudades en JSON (ruta pública) |
| http://localhost:4000/v1/buses | `401 no_autenticado`: **correcto**, el panel exige iniciar sesión |
| http://localhost:3000/admin | Te envía a `/login`. Entra con la cuenta de prueba (Ángel te pasa la contraseña por privado) y verás el panel |

**Cuentas de prueba:** `ana.quispe@panamericana.test` (administradora: ve todo) y `luis.rojas@panamericana.test` (vendedor: no ve la configuración). Sirven para comprobar que cada rol ve solo lo suyo.

---

## 2. Cómo está organizado el proyecto

```
panamericana/
├── shared/src/                 CONTRATO: direcciones de la API y tipos (lo usan backend y web)
│   ├── endpoints.ts            ← todas las rutas de la API
│   ├── tipos/                  ← la forma de los datos que viajan
│   └── index.ts                ← lo que se exporta
│
├── backend/src/
│   ├── modulos/<modulo>/
│   │   ├── dominio/            reglas del negocio (sin librerías)
│   │   ├── casos-de-uso/       acciones del usuario, paso a paso (+ pruebas)
│   │   └── adaptadores/        HTTP (rutas + validación) y SQL (repositorio)
│   ├── compartido/             error base y manejador de errores
│   ├── infraestructura/        configuración, conexión y servidor
│   ├── contenedor.ts           crea y conecta las piezas (único lugar con "new")
│   └── rutas.ts                registra los routers de cada módulo
│
├── web/src/
│   ├── app/                    PÁGINAS: cada carpeta es una URL
│   │   ├── (backoffice)/admin/ panel interno (con menú lateral)
│   │   └── (publico)/          portal para clientes
│   ├── modulos/<modulo>/
│   │   ├── servicios/          llaman a la API
│   │   ├── hooks/              piden datos, cargando, error, refrescar
│   │   └── componentes/        lo que se ve (.tsx)
│   └── compartido/             cliente HTTP y componentes reutilizables
│
└── supabase/                   migraciones .sql y datos de prueba
```

### 2.1 La regla de oro

> **Backend:** las dependencias apuntan **hacia adentro**: `adaptadores → casos-de-uso → dominio`. El dominio no importa nada externo.
> **Web:** `página → componente → hook → servicio → clienteHttp`. Los componentes **nunca** usan `fetch`.

### 2.2 ¿Dónde va cada cosa?

| Si lo que escribes… | Va en |
|---|---|
| Es la dirección de un endpoint | `shared/src/endpoints.ts` |
| Es la forma de un dato que viaja entre API y web | `shared/src/tipos/` |
| Es una regla del negocio ("el CI tiene de 5 a 10 dígitos") | `backend/.../dominio/<Entidad>.ts` |
| Es un error del negocio (404, 409, 400) | `backend/.../dominio/errores.ts` |
| Dice qué datos necesita guardar o leer | `backend/.../dominio/<Entidad>Repositorio.ts` (interfaz) |
| Coordina los pasos de una acción | `backend/.../casos-de-uso/<Accion>.ts` |
| Lee `req.body`, `req.params` o `req.query` | `backend/.../adaptadores/<entidad>Rutas.ts` |
| Escribe SQL | `backend/.../adaptadores/Pg<Entidad>Repositorio.ts` |
| Usa `new` para conectar piezas | `backend/src/contenedor.ts` |
| Llama a la API desde la web | `web/.../servicios/<modulo>Servicio.ts` |
| Pide datos, maneja "cargando", refresca la lista | `web/.../hooks/use<Algo>.ts` |
| Dibuja algo en pantalla | `web/.../componentes/<Nombre>.tsx` |
| Es una URL que el usuario abre | `web/src/app/.../page.tsx` |
| Se reutiliza en varios módulos | `web/src/compartido/componentes/` |

### 2.3 `.ts` o `.tsx`

| Extensión | Cuándo |
|---|---|
| `.ts` | Código sin HTML: tipos, servicios, hooks, todo el backend |
| `.tsx` | Archivos que devuelven JSX (`<div>…</div>`): componentes y páginas |

Si un componente usa **hooks** (`useState`, `useQuery`, `useParams`…) o **eventos** (`onClick`, `onChange`), su primera línea es `'use client';`. Las páginas (`page.tsx`) normalmente **no** lo llevan: solo acomodan componentes.

---

### 2.4 Cómo está organizada la base de datos

La base está **normalizada**: cada dato se guarda **una sola vez**. Tres consecuencias prácticas:

| Regla | Qué significa al programar |
|---|---|
| **Los datos de una persona están en `personas`** | `usuarios`, `clientes` y `choferes` guardan `persona_id`. Para mostrar un nombre se hace `join` con `personas` (solo en el repositorio) |
| **Las listas de valores son catálogos** | `tipos_documento`, `tipos_asiento`, `roles`, `metodos_pago`, `canales_venta`, `categorias_licencia`, `departamentos` y `ciudades`. Guardan el código de siempre (`'ci'`, `'cama'`), así que **el JSON de la API no cambia** |
| **Lo que se puede calcular no se guarda** | El total de una venta, la duración de una ruta, la hora de llegada de un viaje y el estado de una encomienda se leen de las vistas `ventas_totales`, `rutas_resumen`, `viajes_horarios` y `encomiendas_estado_actual` |

> Una vista se consulta igual que una tabla: `select total from ventas_totales where venta_id = $1`.

---

### 2.5 Piezas compartidas que ya existen (úsalas, no las copies)

Antes de escribir algo "genérico", revisa si ya está aquí:

| Pieza | Dónde | Para qué |
|---|---|---|
| `crearPersona`, `normalizarDocumento`, `normalizarTelefono`, `normalizarCorreo` | `backend/src/compartido/dominio/Persona.ts` | Reglas bolivianas de una persona: CI, CE, pasaporte, celular de 8 dígitos, correo |
| `TipoDocumentoInvalidoError`, `DocumentoInvalidoError`, `TelefonoInvalidoError`, `CorreoInvalidoError`… | `backend/src/compartido/dominio/erroresPersona.ts` | Errores de los datos personales (400) |
| `DatoObligatorioError` | `backend/src/compartido/dominio/erroresComunes.ts` | Un texto obligatorio llegó vacío (400) |
| `enTransaccion(pool, trabajo)` | `backend/src/compartido/adaptadores/pg/transaccion.ts` | Varias consultas que se guardan todas juntas o ninguna |
| `guardarPersona(conexion, persona)` | `backend/src/compartido/adaptadores/pg/personasSql.ts` | Guarda la persona (o reutiliza la que ya existe con ese documento) y devuelve su `id` |
| `CODIGOS_PG`, `codigoPg(error)` | `backend/src/compartido/adaptadores/pg/erroresPg.ts` | Reconocer errores de la base: valor repetido (23505), referencia inexistente (23503) |
| `Autorizacion`, `ROLES_INTERNOS`, `SOLO_ADMINISTRADOR`, `ROLES_VENTA`, `ROLES_ENCOMIENDAS`, `usuarioEnSesion(res)` | `backend/src/compartido/adaptadores/http/autorizacion.ts` | Proteger un endpoint por rol y saber quién hizo la petición |
| `resolverTramo`, `horaDePaso`, `precioDeTramo` | `backend/src/compartido/dominio/Tramo.ts` | Reglas del tramo de un viaje: paradas válidas, hora de paso y precio proporcional redondeado a Bs 0,50 |
| `generarCodigo`, `enmascararDocumento` | `backend/src/compartido/dominio/Codigo.ts` | Códigos legibles de venta y pasaje (`V-…`, `P-…`) y documentos ocultos (`****351`) |
| `PASAJE_ACTIVO`, `liberarReservasVencidas` | `backend/src/compartido/adaptadores/pg/reservasSql.ts` | Qué pasaje ocupa un asiento y liberar las reservas vencidas |
| `sumarDias`, `diasEntre` | `backend/src/compartido/dominio/Fechas.ts` | Cuentas con fechas AAAA-MM-DD (dias de La Paz) sin horas |
| `guardarCliente(conexion, persona)` | `backend/src/compartido/adaptadores/pg/personasSql.ts` | Guarda la persona y la deja como cliente (pasajero, remitente o destinatario); devuelve el id del cliente |
| `Boton` | `web/src/compartido/componentes/Boton.tsx` | Botón con estado "Guardando..." |
| `Campo`, `CampoSeleccion` | `web/src/compartido/componentes/Campo.tsx` | Campos de formulario con etiqueta y mensaje de error |
| `MenuLateral` | `web/src/compartido/componentes/MenuLateral.tsx` | Menú del panel; muestra solo las opciones de los roles del usuario y resalta la pantalla actual |
| `PlanoAsientos`, `CuentaRegresiva` | `web/src/compartido/componentes/` | Croquis de asientos por piso y reloj de la reserva |
| `GraficoBarras` | `web/src/compartido/componentes/GraficoBarras.tsx` | Grafico de barras agrupadas en SVG, sin librerias |
| `CodigoQR`, `ConsultaPorCodigo` | `web/src/compartido/componentes/` | QR de un codigo y formulario "escribe tu codigo" (boleto, encomienda) |
| `SeleccionDeAsientos` | `web/src/modulos/ventas/componentes/SeleccionDeAsientos.tsx` | Elegir asientos y pasajeros de un tramo (lo usan el portal y la taquilla) |
| `useTiposAsiento` | `web/src/modulos/catalogos/hooks/useCatalogos.ts` | Tipos de asiento del catalogo (normal, semicama, cama) |
| `hoyEnBolivia`, `formatearFecha`, `horaEnBolivia`, `fechaHoraEnBolivia`, `aIsoBolivia`, `formatearDuracion` | `web/src/compartido/utilidades/fechas.ts` | Fechas y horas siempre en hora de La Paz |
| `formatearBs` | `web/src/compartido/utilidades/dinero.ts` | Montos como `Bs 47,50` |
| `useSesion` | `web/src/modulos/sesion/hooks/useSesion.ts` | El usuario conectado y sus roles |
| `useCiudades`, `useTiposDocumento`, `useRoles` | `web/src/modulos/catalogos/hooks/useCatalogos.ts` | Listas para llenar selectores |

> **Regla:** si una pieza la necesitan **dos módulos o más**, va en `compartido/`. Si solo la usa uno, va dentro de ese módulo.

---

## 3. El recorrido de una petición

Ejemplo: el administrador registra un chofer.

```
[Pantalla]   app/(backoffice)/admin/choferes/page.tsx
      │ muestra
[Componente] modulos/choferes/componentes/FormularioChofer.tsx   ← el usuario pulsa "Registrar"
      │ llama
[Hook]       modulos/choferes/hooks/useRegistrarChofer.ts
      │ llama
[Servicio]   modulos/choferes/servicios/choferesServicio.ts       ← usa RUTAS_API.choferes.base
      │ llama
[clienteHttp] compartido/servicios/clienteHttp.ts                 ← único fetch
      │ POST http://localhost:4000/v1/choferes
      ▼
[Rutas]      backend/.../adaptadores/choferRutas.ts                ← Zod valida el JSON
      │
[Caso de uso] backend/.../casos-de-uso/RegistrarChofer.ts
      │                  │
[Dominio] Chofer.crear() │  ← reglas bolivianas (CI, celular, licencia)
                         │
[Repositorio] backend/.../adaptadores/PgChoferRepositorio.ts       ← insert into choferes
      │
   [Supabase]
```

Si algo falla, el error "sube" solo hasta `manejadorErrores.ts`, que responde con el código HTTP del error (400, 404, 409). La web lo recibe como `ErrorDeApi` y el componente muestra el mensaje.

---

## 4. Ejemplo completo: módulo `choferes`, paso a paso

### 4.0 Qué vamos a construir

Las dos tablas ya existen en la base:

- **`personas`**: `id`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `telefono`, `correo`, `fecha_nacimiento`.
- **`choferes`**: `id`, `persona_id` (→ `personas.id`), `numero_licencia`, `categoria_licencia`, `fecha_vencimiento_licencia`, `activo`.

Los datos personales **no se repiten** en cada tabla: un chofer que además compre un pasaje es **una sola persona**. Para el resto del código (tipos, entidad, API y pantallas) el chofer se ve como un solo objeto con todos sus campos; el `join` lo hace únicamente el repositorio.

| Método | Ruta | Qué hace | Respuestas |
|---|---|---|---|
| GET | `/v1/choferes?activo=true` | Lista choferes (filtro opcional) | 200, 400 |
| GET | `/v1/choferes/:id` | Detalle de un chofer | 200, 400, 404 |
| POST | `/v1/choferes` | Registra un chofer | 201, 400, 409 |
| PUT | `/v1/choferes/:id` | Cambia el celular o el estado activo | 200, 400, 404 |

**Reglas del negocio (Bolivia):**
- Documento `ci`, `ce` o `pasaporte`; si es `ci`, de 5 a 10 dígitos con complemento opcional (`5120478` o `5120478-1A`).
- Celular opcional de 8 dígitos que empieza con 6 o 7.
- No se registra un chofer con la licencia vencida.
- No se repite el documento ni el número de licencia (409).

> **Orden recomendado para abrir PRs:** primero un PR pequeño solo con `shared/` (paso 1), para que frontend y backend trabajen en paralelo contra el mismo contrato. Después el backend (pasos 2 a 6) y la web (pasos 7 a 11).

---

### Paso 1 — `shared/`: el contrato

**1a. Tipos.** `TipoDocumento` **ya existe** en `shared/src/tipos/comunes.ts` (lo usan clientes, usuarios y choferes): impórtalo, **no lo declares otra vez**.

Archivo nuevo con los tipos del chofer. Los nombres de los campos son **exactamente** los de la tabla:

```ts
// archivo: shared/src/tipos/chofer.ts
import type { TipoDocumento } from './comunes';

/** un chofer tal como lo devuelve la API (mismos nombres que la tabla choferes) */
export type Chofer = {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  numero_licencia: string;
  categoria_licencia: string;
  /** fecha en formato AAAA-MM-DD */
  fecha_vencimiento_licencia: string;
  telefono: string | null;
  activo: boolean;
};

/** datos que se envian para registrar un chofer */
export type RegistrarChoferEntrada = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  numero_licencia: string;
  categoria_licencia: string;
  fecha_vencimiento_licencia: string;
  telefono?: string | null;
};

/** datos que se pueden cambiar de un chofer (todos opcionales) */
export type ActualizarChoferEntrada = {
  telefono?: string | null;
  activo?: boolean;
};
```

**1b. Exportarlos** en `shared/src/index.ts` (agrega tus líneas; no borres las de otros):

```ts
// en: shared/src/index.ts (agregar al final)
export type { ActualizarChoferEntrada, Chofer, RegistrarChoferEntrada } from './tipos/chofer';
```

**1c. Rutas** en `shared/src/endpoints.ts`, dentro de `RUTAS_API`:

```ts
// en: shared/src/endpoints.ts (agregar dentro de RUTAS_API)
  choferes: {
    /** GET listar (?activo=true|false) · POST registrar */
    base: '/v1/choferes',
    /** GET detalle · PUT actualizar (formato para Express) */
    porId: '/v1/choferes/:id',
    /** formato para la web */
    detalle: (id: string): string => `/v1/choferes/${id}`,
  },
```

> Cada vez que cambies `shared/`, `npm run dev:backend` y `npm run dev:web` lo recompilan al arrancar. Si ya estaban corriendo, reinícialos o ejecuta `npm run build:shared`.

---

### Paso 2 — Backend: dominio

**2a. Errores del negocio.** Cada error sabe su código HTTP. El manejador de errores lo traduce solo. Los errores de los datos personales (documento, celular) **ya existen** en el núcleo compartido (sección 2.5): aquí solo van los del chofer.

```ts
// archivo: backend/src/modulos/choferes/dominio/errores.ts
import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

// los errores de los DATOS PERSONALES (documento, celular, correo) ya existen en
// compartido/dominio/erroresPersona.ts: aqui van solo los errores propios del chofer

export class LicenciaVencidaError extends ErrorDeDominio {
  readonly codigo = 'licencia_vencida';
  readonly estadoHttp = 400;

  constructor(fecha: string) {
    super(`No se puede registrar un chofer con la licencia vencida (${fecha})`);
  }
}

export class ChoferDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'chofer_duplicado';
  readonly estadoHttp = 409;

  constructor() {
    super('Ya existe un chofer con ese documento o numero de licencia');
  }
}

export class ChoferNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'chofer_no_encontrado';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe un chofer con id ${id}`);
  }
}
```

**2b. Entidad.** Aquí viven las reglas. No importa Express, `pg`, Zod ni `@panamericana/shared`. Sí puede usar el **núcleo compartido del dominio** (`compartido/dominio/`), que tampoco depende de librerías.

```ts
// archivo: backend/src/modulos/choferes/dominio/Chofer.ts
import { crearPersona, normalizarTelefono } from '../../../compartido/dominio/Persona';
import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import { LicenciaVencidaError } from './errores';

// el tipo de documento es de TODAS las personas: vive en el nucleo compartido y aqui se reexporta
export type { TipoDocumento };

export type DatosNuevoChofer = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  numero_licencia: string;
  categoria_licencia: string;
  fecha_vencimiento_licencia: string;
  telefono?: string | null;
};

export type DatosChofer = Omit<DatosNuevoChofer, 'telefono'> & {
  id: string;
  telefono: string | null;
  activo: boolean;
};

/**
 * Entidad del dominio: las REGLAS del negocio sobre un chofer.
 * Los campos se llaman igual que en la base de datos.
 *
 * Las reglas de la PERSONA (CI boliviano, celular, nombres) ya existen en
 * compartido/dominio/Persona.ts: se reutilizan, no se copian. Aqui solo van
 * las reglas propias del chofer (la licencia).
 */
export class Chofer {
  readonly id: string;
  readonly tipo_documento: TipoDocumento;
  readonly numero_documento: string;
  readonly nombres: string;
  readonly apellidos: string;
  readonly numero_licencia: string;
  readonly categoria_licencia: string;
  readonly fecha_vencimiento_licencia: string;
  readonly telefono: string | null;
  readonly activo: boolean;

  private constructor(datos: DatosChofer) {
    this.id = datos.id;
    this.tipo_documento = datos.tipo_documento;
    this.numero_documento = datos.numero_documento;
    this.nombres = datos.nombres;
    this.apellidos = datos.apellidos;
    this.numero_licencia = datos.numero_licencia;
    this.categoria_licencia = datos.categoria_licencia;
    this.fecha_vencimiento_licencia = datos.fecha_vencimiento_licencia;
    this.telefono = datos.telefono;
    this.activo = datos.activo;
  }

  /**
   * Crea un chofer nuevo aplicando las reglas.
   * Recibe "hoy" desde afuera para que las pruebas no dependan del reloj.
   */
  static crear(datos: DatosNuevoChofer, hoy: Date): Chofer {
    // 1) reglas de la persona: documento, nombres y celular (nucleo compartido)
    const persona = crearPersona(datos, hoy);

    // 2) regla propia del chofer: la licencia debe estar vigente
    const hoyTexto = hoy.toISOString().slice(0, 10);
    if (datos.fecha_vencimiento_licencia <= hoyTexto) {
      throw new LicenciaVencidaError(datos.fecha_vencimiento_licencia);
    }

    return new Chofer({
      id: crypto.randomUUID(),
      tipo_documento: persona.tipo_documento,
      numero_documento: persona.numero_documento,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      numero_licencia: datos.numero_licencia.trim().toUpperCase(),
      // el catalogo categorias_licencia guarda los codigos en minuscula: 'a', 'b', 'c'...
      categoria_licencia: datos.categoria_licencia.trim().toLowerCase(),
      fecha_vencimiento_licencia: datos.fecha_vencimiento_licencia,
      telefono: persona.telefono,
      activo: true,
    });
  }

  /** reconstruye un chofer que YA existe en la base (no vuelve a validar) */
  static reconstruir(datos: DatosChofer): Chofer {
    return new Chofer(datos);
  }

  /** devuelve un chofer NUEVO con los cambios aplicados (la entidad no se modifica) */
  actualizar(cambios: { telefono?: string | null; activo?: boolean }): Chofer {
    return new Chofer({
      ...this,
      telefono: cambios.telefono === undefined ? this.telefono : normalizarTelefono(cambios.telefono),
      activo: cambios.activo ?? this.activo,
    });
  }
}
```

**2c. Interfaz del repositorio** (el "enchufe": dice **qué** necesita, no **cómo**):

```ts
// archivo: backend/src/modulos/choferes/dominio/ChoferRepositorio.ts
import type { Chofer, TipoDocumento } from './Chofer';

export interface ChoferRepositorio {
  listar(filtro: { activo?: boolean }): Promise<Chofer[]>;
  buscarPorId(id: string): Promise<Chofer | null>;
  existeDocumento(tipo_documento: TipoDocumento, numero_documento: string): Promise<boolean>;
  guardar(chofer: Chofer): Promise<void>;
  actualizar(chofer: Chofer): Promise<void>;
}
```

> ¿Por qué el dominio tiene su propio `TipoDocumento` si ya está en `shared`? Porque el dominio **no depende** de cómo viajan los datos por internet. `shared` es para los adaptadores y la web.

---

### Paso 3 — Backend: casos de uso

Un caso de uso = **una acción** del usuario. Recibe objetos simples (nunca `req` ni `res`).

```ts
// archivo: backend/src/modulos/choferes/casos-de-uso/ListarChoferes.ts
import type { Chofer } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';

/** Caso de uso: listar choferes, opcionalmente solo activos o solo inactivos */
export class ListarChoferes {
  constructor(private readonly choferes: ChoferRepositorio) {}

  async ejecutar(filtro: { activo?: boolean }): Promise<Chofer[]> {
    return this.choferes.listar(filtro);
  }
}
```

```ts
// archivo: backend/src/modulos/choferes/casos-de-uso/ObtenerChofer.ts
import type { Chofer } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';
import { ChoferNoEncontradoError } from '../dominio/errores';

/** Caso de uso: ver el detalle de un chofer */
export class ObtenerChofer {
  constructor(private readonly choferes: ChoferRepositorio) {}

  async ejecutar(id: string): Promise<Chofer> {
    const chofer = await this.choferes.buscarPorId(id);
    if (!chofer) {
      throw new ChoferNoEncontradoError(id);
    }
    return chofer;
  }
}
```

```ts
// archivo: backend/src/modulos/choferes/casos-de-uso/RegistrarChofer.ts
import { Chofer } from '../dominio/Chofer';
import type { DatosNuevoChofer } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';
import { ChoferDuplicadoError } from '../dominio/errores';

/** Caso de uso: registrar un chofer nuevo */
export class RegistrarChofer {
  constructor(
    private readonly choferes: ChoferRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(entrada: DatosNuevoChofer): Promise<Chofer> {
    const chofer = Chofer.crear(entrada, this.ahora());

    if (await this.choferes.existeDocumento(chofer.tipo_documento, chofer.numero_documento)) {
      throw new ChoferDuplicadoError();
    }

    await this.choferes.guardar(chofer);
    return chofer;
  }
}
```

```ts
// archivo: backend/src/modulos/choferes/casos-de-uso/ActualizarChofer.ts
import type { Chofer } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';
import { ChoferNoEncontradoError } from '../dominio/errores';

/** Caso de uso: cambiar el celular o el estado activo de un chofer */
export class ActualizarChofer {
  constructor(private readonly choferes: ChoferRepositorio) {}

  async ejecutar(id: string, cambios: { telefono?: string | null; activo?: boolean }): Promise<Chofer> {
    const actual = await this.choferes.buscarPorId(id);
    if (!actual) {
      throw new ChoferNoEncontradoError(id);
    }

    const actualizado = actual.actualizar(cambios);
    await this.choferes.actualizar(actualizado);
    return actualizado;
  }
}
```

**Prueba del caso de uso** con un repositorio en memoria: corre sin base de datos y sin internet.

```ts
// archivo: backend/src/modulos/choferes/casos-de-uso/RegistrarChofer.test.ts
import { describe, expect, it } from 'vitest';
import type { Chofer, TipoDocumento } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';
import { DocumentoInvalidoError } from '../../../compartido/dominio/erroresPersona';
import { ChoferDuplicadoError, LicenciaVencidaError } from '../dominio/errores';
import { RegistrarChofer } from './RegistrarChofer';

/** repositorio falso: guarda en memoria */
class ChoferRepositorioEnMemoria implements ChoferRepositorio {
  choferes: Chofer[] = [];

  async listar(): Promise<Chofer[]> {
    return this.choferes;
  }

  async buscarPorId(id: string): Promise<Chofer | null> {
    return this.choferes.find((chofer) => chofer.id === id) ?? null;
  }

  async existeDocumento(tipo_documento: TipoDocumento, numero_documento: string): Promise<boolean> {
    return this.choferes.some(
      (chofer) => chofer.tipo_documento === tipo_documento && chofer.numero_documento === numero_documento,
    );
  }

  async guardar(chofer: Chofer): Promise<void> {
    this.choferes.push(chofer);
  }

  async actualizar(chofer: Chofer): Promise<void> {
    this.choferes = this.choferes.map((actual) => (actual.id === chofer.id ? chofer : actual));
  }
}

const HOY = new Date('2026-09-15T12:00:00Z');

const datosValidos = {
  tipo_documento: 'ci' as const,
  numero_documento: '5120478',
  nombres: 'Pedro',
  apellidos: 'Ramos',
  numero_licencia: '5120478',
  categoria_licencia: 'c',
  fecha_vencimiento_licencia: '2028-05-31',
  telefono: '70011223',
};

function crearCaso() {
  const repositorio = new ChoferRepositorioEnMemoria();
  return { repositorio, registrarChofer: new RegistrarChofer(repositorio, () => HOY) };
}

describe('RegistrarChofer', () => {
  it('registra un chofer con CI valido y lo deja activo', async () => {
    const { repositorio, registrarChofer } = crearCaso();

    const chofer = await registrarChofer.ejecutar(datosValidos);

    expect(chofer.activo).toBe(true);
    expect(repositorio.choferes).toHaveLength(1);
  });

  it('rechaza un CI con letras', async () => {
    const { registrarChofer } = crearCaso();

    await expect(
      registrarChofer.ejecutar({ ...datosValidos, numero_documento: 'ABC123' }),
    ).rejects.toThrow(DocumentoInvalidoError);
  });

  it('rechaza una licencia vencida', async () => {
    const { registrarChofer } = crearCaso();

    await expect(
      registrarChofer.ejecutar({ ...datosValidos, fecha_vencimiento_licencia: '2026-09-01' }),
    ).rejects.toThrow(LicenciaVencidaError);
  });

  it('no permite dos choferes con el mismo documento', async () => {
    const { registrarChofer } = crearCaso();
    await registrarChofer.ejecutar(datosValidos);

    await expect(registrarChofer.ejecutar(datosValidos)).rejects.toThrow(ChoferDuplicadoError);
  });
});
```

---

### Paso 4 — Backend: adaptadores

**4a. Repositorio con SQL.** El **único** lugar del módulo donde se escribe SQL.

```ts
// archivo: backend/src/modulos/choferes/adaptadores/PgChoferRepositorio.ts
import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { guardarPersona } from '../../../compartido/adaptadores/pg/personasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import { Chofer } from '../dominio/Chofer';
import type { TipoDocumento } from '../dominio/Chofer';
import type { ChoferRepositorio } from '../dominio/ChoferRepositorio';
import { ChoferDuplicadoError } from '../dominio/errores';

/** fila tal como sale del join de choferes con personas (mismos nombres que las columnas) */
type FilaChofer = {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  numero_licencia: string;
  categoria_licencia: string;
  fecha_vencimiento_licencia: string;
  telefono: string | null;
  activo: boolean;
};

// los datos personales estan en "personas" y los de la licencia en "choferes": por eso el join
// las columnas "date" se piden como texto (::text) para recibir "2028-05-31" y no un objeto Date
const COLUMNAS = `ch.id, p.tipo_documento, p.numero_documento, p.nombres, p.apellidos,
       ch.numero_licencia, ch.categoria_licencia, ch.fecha_vencimiento_licencia::text,
       p.telefono, ch.activo`;

const DESDE = `from choferes ch join personas p on p.id = ch.persona_id`;

export class PgChoferRepositorio implements ChoferRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(filtro: { activo?: boolean }): Promise<Chofer[]> {
    // si el filtro llega vacio ($1 = null) se listan todos
    const resultado = await this.db.query<FilaChofer>(
      `select ${COLUMNAS}
         ${DESDE}
        where ($1::boolean is null or ch.activo = $1)
        order by p.apellidos, p.nombres`,
      [filtro.activo ?? null],
    );
    return resultado.rows.map((fila) => Chofer.reconstruir(fila));
  }

  async buscarPorId(id: string): Promise<Chofer | null> {
    const resultado = await this.db.query<FilaChofer>(
      `select ${COLUMNAS} ${DESDE} where ch.id = $1`,
      [id],
    );
    const fila = resultado.rows[0];
    return fila ? Chofer.reconstruir(fila) : null;
  }

  async existeDocumento(tipo_documento: TipoDocumento, numero_documento: string): Promise<boolean> {
    // pregunta si esa persona YA es chofer (puede existir como cliente y eso no estorba)
    const resultado = await this.db.query(
      `select 1 ${DESDE} where p.tipo_documento = $1 and p.numero_documento = $2`,
      [tipo_documento, numero_documento],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  async guardar(chofer: Chofer): Promise<void> {
    try {
      // dos inserts (persona + chofer): enTransaccion los guarda juntos o no guarda ninguno
      await enTransaccion(this.db, async (conexion) => {
        // si la persona ya existe por documento (por ejemplo, es cliente), se reutiliza
        const persona_id = await guardarPersona(conexion, {
          ...chofer,
          correo: null,
          fecha_nacimiento: null,
        });

        await conexion.query(
          `insert into choferes (id, persona_id, numero_licencia, categoria_licencia,
                                 fecha_vencimiento_licencia, activo)
           values ($1, $2, $3, $4, $5, $6)`,
          [
            chofer.id,
            persona_id,
            chofer.numero_licencia,
            chofer.categoria_licencia,
            chofer.fecha_vencimiento_licencia,
            chofer.activo,
          ],
        );
      });
    } catch (error) {
      // la base rechazo un valor repetido (por ejemplo, el numero de licencia)
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) {
        throw new ChoferDuplicadoError();
      }
      throw error;
    }
  }

  async actualizar(chofer: Chofer): Promise<void> {
    // el celular vive en personas y el estado activo en choferes: otra vez, una transaccion
    // actualizado_en lo cambia solo un trigger de la base
    await enTransaccion(this.db, async (conexion) => {
      await conexion.query('update choferes set activo = $2 where id = $1', [
        chofer.id,
        chofer.activo,
      ]);
      await conexion.query(
        `update personas set telefono = $2
          where id = (select persona_id from choferes where id = $1)`,
        [chofer.id, chofer.telefono],
      );
    });
  }
}
```

> 🛑 **Nunca pegues valores del usuario dentro del texto SQL.** Los valores van siempre en el arreglo (`$1`, `$2`…). `${COLUMNAS}` sí se puede porque es un texto fijo escrito por nosotros.

**4b. Rutas HTTP.** Zod valida la **forma**; el dominio valida el **negocio**. No hace falta `try/catch`.

Cada endpoint del panel se **protege por rol** con `autorizacion.requiere(...)`: sin sesión responde **401**, con un rol que no corresponde **403**. Los choferes los consulta todo el personal y solo la administradora los registra o cambia.

```ts
// archivo: backend/src/modulos/choferes/adaptadores/choferRutas.ts
import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_INTERNOS, SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { ActualizarChofer } from '../casos-de-uso/ActualizarChofer';
import type { ListarChoferes } from '../casos-de-uso/ListarChoferes';
import type { ObtenerChofer } from '../casos-de-uso/ObtenerChofer';
import type { RegistrarChofer } from '../casos-de-uso/RegistrarChofer';

/** :id debe ser un uuid; si no, responde 400 en vez de un error de la base */
const esquemaId = z.object({ id: z.uuid() });

/** ?activo=true o ?activo=false (opcional) */
const esquemaFiltro = z.object({ activo: z.enum(['true', 'false']).optional() });

const esquemaRegistrar = z.object({
  tipo_documento: z.enum(['ci', 'ce', 'pasaporte']),
  numero_documento: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  numero_licencia: z.string().min(1),
  categoria_licencia: z.string().min(1),
  fecha_vencimiento_licencia: z.iso.date(),
  telefono: z.string().nullable().optional(),
});

const esquemaActualizar = z.object({
  telefono: z.string().nullable().optional(),
  activo: z.boolean().optional(),
});

export function choferRutas(
  casos: {
    listarChoferes: ListarChoferes;
    obtenerChofer: ObtenerChofer;
    registrarChofer: RegistrarChofer;
    actualizarChofer: ActualizarChofer;
  },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  router.get(RUTAS_API.choferes.base, autorizacion.requiere(...ROLES_INTERNOS), async (req, res) => {
    const { activo } = esquemaFiltro.parse(req.query);
    const choferes = await casos.listarChoferes.ejecutar({
      activo: activo === undefined ? undefined : activo === 'true',
    });
    res.json(choferes);
  });

  router.get(RUTAS_API.choferes.porId, autorizacion.requiere(...ROLES_INTERNOS), async (req, res) => {
    const { id } = esquemaId.parse(req.params);
    const chofer = await casos.obtenerChofer.ejecutar(id);
    res.json(chofer);
  });

  router.post(RUTAS_API.choferes.base, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const entrada = esquemaRegistrar.parse(req.body);
    const chofer = await casos.registrarChofer.ejecutar(entrada);
    res.status(201).json(chofer);
  });

  router.put(RUTAS_API.choferes.porId, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const { id } = esquemaId.parse(req.params);
    const cambios = esquemaActualizar.parse(req.body);
    const chofer = await casos.actualizarChofer.ejecutar(id, cambios);
    res.json(chofer);
  });

  return router;
}
```

---

### Paso 5 — Backend: conectar las piezas

**5a.** En `backend/src/contenedor.ts`, crea el repositorio y los casos de uso **y agrégalos** al objeto `casosDeUso` (sin borrar los de otros módulos):

```ts
// en: backend/src/contenedor.ts (agregar)
import { PgChoferRepositorio } from './modulos/choferes/adaptadores/PgChoferRepositorio';
import { ActualizarChofer } from './modulos/choferes/casos-de-uso/ActualizarChofer';
import { ListarChoferes } from './modulos/choferes/casos-de-uso/ListarChoferes';
import { ObtenerChofer } from './modulos/choferes/casos-de-uso/ObtenerChofer';
import { RegistrarChofer } from './modulos/choferes/casos-de-uso/RegistrarChofer';

// modulo: choferes
const choferRepositorio = new PgChoferRepositorio(pool);

export const casosDeUso = {
  // ...los casos de uso que ya estaban (buses, etc.)
  listarChoferes: new ListarChoferes(choferRepositorio),
  obtenerChofer: new ObtenerChofer(choferRepositorio),
  registrarChofer: new RegistrarChofer(choferRepositorio),
  actualizarChofer: new ActualizarChofer(choferRepositorio),
};
```

**5b.** En `backend/src/rutas.ts`, registra el router pasándole `autorizacion` (ya se importa de `contenedor.ts`):

```ts
// en: backend/src/rutas.ts (agregar)
import { choferRutas } from './modulos/choferes/adaptadores/choferRutas';

export function registrarRutas(app: Express): void {
  // ...los routers que ya estaban
  app.use(choferRutas(casosDeUso, autorizacion));
}
```

---

### Paso 6 — Probar la API (antes de tocar la web)

Con `npm run dev:backend` corriendo, en Git Bash.

**6a. Consigue un token** (dura 1 hora). Reemplaza `CONTRASENA` por la de la cuenta de prueba:

```bash
TOKEN=$(curl -s "https://tvyhpwpyxmbdfxogopnl.supabase.co/auth/v1/token?grant_type=password" -H "apikey: sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi" -H "Content-Type: application/json" -d '{"email":"ana.quispe@panamericana.test","password":"CONTRASENA"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
```

Sin el token, cualquier llamada al panel responde `401 no_autenticado` (compruébalo quitando el `-H`).

**6b. Prueba los endpoints** con el token:

```bash
curl http://localhost:4000/v1/choferes -H "Authorization: Bearer $TOKEN"
```

```bash
curl "http://localhost:4000/v1/choferes?activo=true" -H "Authorization: Bearer $TOKEN"
```

```bash
curl http://localhost:4000/v1/choferes/00000000-0000-4000-8000-000000000501 -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:4000/v1/choferes -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"tipo_documento":"ci","numero_documento":"ABC","nombres":"X","apellidos":"Y","numero_licencia":"1","categoria_licencia":"c","fecha_vencimiento_licencia":"2028-01-01"}'
```

| Prueba | Respuesta esperada |
|---|---|
| Listar | 200 y el chofer de prueba (Pedro Ramos) |
| Detalle con el id de prueba | 200 con `"fecha_vencimiento_licencia":"2028-05-31"` |
| Detalle con un uuid que no existe | 404 `chofer_no_encontrado` |
| Detalle con `/v1/choferes/abc` | 400 `solicitud_invalida` |
| POST con CI `ABC` | 400 `documento_invalido` |
| POST repitiendo documento | 409 `chofer_duplicado` |
| Cualquiera sin el encabezado `Authorization` | 401 `no_autenticado` |
| POST con el token de Luis (vendedor) | 403 `sin_permiso` |

> También puedes usar la extensión **Thunder Client** o **REST Client** de VS Code en lugar de `curl`.
> Si creas un chofer de prueba, **bórralo o desactívalo** al terminar (la base es compartida).

---

### Paso 7 — Web: servicio

El servicio dice **qué endpoint** llamar. Las direcciones salen de `RUTAS_API`, **nunca escritas a mano**.

```ts
// archivo: web/src/modulos/choferes/servicios/choferesServicio.ts
import { RUTAS_API } from '@panamericana/shared';
import type { ActualizarChoferEntrada, Chofer, RegistrarChoferEntrada } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

export const choferesServicio = {
  listar: (filtro: { activo?: boolean } = {}) => {
    const consulta =
      filtro.activo === undefined ? '' : `?${new URLSearchParams({ activo: String(filtro.activo) })}`;
    return clienteHttp.get<Chofer[]>(`${RUTAS_API.choferes.base}${consulta}`);
  },

  obtener: (id: string) => clienteHttp.get<Chofer>(RUTAS_API.choferes.detalle(id)),

  registrar: (datos: RegistrarChoferEntrada) =>
    clienteHttp.post<Chofer>(RUTAS_API.choferes.base, datos),

  actualizar: (id: string, cambios: ActualizarChoferEntrada) =>
    clienteHttp.put<Chofer>(RUTAS_API.choferes.detalle(id), cambios),
};
```

---

### Paso 8 — Web: hooks

**Consultas** (leer datos). Las **claves** identifican cada dato en la caché; con ellas se refresca todo lo del módulo de una vez.

```ts
// archivo: web/src/modulos/choferes/hooks/useChoferes.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { choferesServicio } from '../servicios/choferesServicio';

/** claves de cache del modulo: invalidar "todos" refresca listas y detalles */
export const clavesChoferes = {
  todos: ['choferes'] as const,
  lista: (activo?: boolean) => ['choferes', 'lista', activo ?? 'todos'] as const,
  detalle: (id: string) => ['choferes', 'detalle', id] as const,
};

/** HOOK: lista de choferes con filtro opcional */
export function useChoferes(filtro: { activo?: boolean } = {}) {
  return useQuery({
    queryKey: clavesChoferes.lista(filtro.activo),
    queryFn: () => choferesServicio.listar(filtro),
  });
}

/** HOOK: detalle de un chofer */
export function useChofer(id: string) {
  return useQuery({
    queryKey: clavesChoferes.detalle(id),
    queryFn: () => choferesServicio.obtener(id),
  });
}
```

**Mutaciones** (crear o cambiar datos). Al terminar bien, invalidan la caché y las pantallas se actualizan solas.

```ts
// archivo: web/src/modulos/choferes/hooks/useRegistrarChofer.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { choferesServicio } from '../servicios/choferesServicio';
import { clavesChoferes } from './useChoferes';

/** HOOK: registra un chofer y refresca las listas */
export function useRegistrarChofer() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: choferesServicio.registrar,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: clavesChoferes.todos });
    },
  });
}
```

```ts
// archivo: web/src/modulos/choferes/hooks/useActualizarChofer.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ActualizarChoferEntrada } from '@panamericana/shared';
import { choferesServicio } from '../servicios/choferesServicio';
import { clavesChoferes } from './useChoferes';

/** HOOK: cambia el celular o el estado de un chofer y refresca lista y detalle */
export function useActualizarChofer(id: string) {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (cambios: ActualizarChoferEntrada) => choferesServicio.actualizar(id, cambios),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: clavesChoferes.todos });
    },
  });
}
```

---

### Paso 9 — Web: componentes `.tsx`

**9a. Componente reutilizable** (en `compartido/` porque sirve para cualquier módulo con estado activo). No usa hooks, así que no lleva `'use client'`.

```tsx
// archivo: web/src/compartido/componentes/InsigniaEstado.tsx
type Props = {
  activo: boolean;
};

/** etiqueta de color para mostrar si algo esta activo o inactivo */
export function InsigniaEstado({ activo }: Props) {
  const estilo = activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600';

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estilo}`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
```

**9b. Tabla con filtro.** Maneja los tres estados que **siempre** hay que manejar: cargando, error y vacío.

```tsx
// archivo: web/src/modulos/choferes/componentes/TablaChoferes.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { InsigniaEstado } from '@/compartido/componentes/InsigniaEstado';
import { useChoferes } from '../hooks/useChoferes';

type Filtro = 'activos' | 'inactivos' | 'todos';

export function TablaChoferes() {
  const [filtro, setFiltro] = useState<Filtro>('activos');
  const activo = filtro === 'todos' ? undefined : filtro === 'activos';
  const { data: choferes, isPending, error } = useChoferes({ activo });

  return (
    <div className="flex flex-col gap-3">
      <select
        className="w-48 rounded border border-slate-300 px-3 py-2 text-sm"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value as Filtro)}
      >
        <option value="activos">Solo activos</option>
        <option value="inactivos">Solo inactivos</option>
        <option value="todos">Todos</option>
      </select>

      {isPending && <p className="text-slate-500">Cargando choferes...</p>}

      {error && <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>}

      {choferes && choferes.length === 0 && (
        <p className="text-slate-500">No hay choferes para este filtro.</p>
      )}

      {choferes && choferes.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left">
              <th className="py-2">Nombre</th>
              <th className="py-2">Documento</th>
              <th className="py-2">Licencia</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {choferes.map((chofer) => (
              <tr key={chofer.id} className="border-b border-slate-200">
                <td className="py-2">
                  <Link href={`/admin/choferes/${chofer.id}`} className="text-blue-700 hover:underline">
                    {chofer.apellidos}, {chofer.nombres}
                  </Link>
                </td>
                <td className="py-2">
                  {chofer.tipo_documento.toUpperCase()} {chofer.numero_documento}
                </td>
                <td className="py-2">
                  {chofer.categoria_licencia} · vence {chofer.fecha_vencimiento_licencia}
                </td>
                <td className="py-2">
                  <InsigniaEstado activo={chofer.activo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

**9c. Formulario.** Muestra el mensaje de error que devuelve la API (400 o 409).

```tsx
// archivo: web/src/modulos/choferes/componentes/FormularioChofer.tsx
'use client';

import { useState } from 'react';
import type { RegistrarChoferEntrada, TipoDocumento } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useTiposDocumento } from '@/modulos/catalogos/hooks/useCatalogos';
import { useRegistrarChofer } from '../hooks/useRegistrarChofer';

const VALORES_INICIALES: RegistrarChoferEntrada = {
  tipo_documento: 'ci',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  numero_licencia: '',
  categoria_licencia: 'c',
  fecha_vencimiento_licencia: '',
  telefono: '',
};

/**
 * Formulario de registro. Usa los componentes compartidos Campo, CampoSeleccion y Boton
 * (cada campo trae su etiqueta) y los tipos de documento salen del catalogo de la API.
 */
export function FormularioChofer() {
  const [valores, setValores] = useState<RegistrarChoferEntrada>(VALORES_INICIALES);
  const tiposDocumento = useTiposDocumento();
  const registrar = useRegistrarChofer();

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const telefono = valores.telefono?.trim() ? valores.telefono : null;

    registrar.mutate(
      { ...valores, telefono },
      { onSuccess: () => setValores(VALORES_INICIALES) },
    );
  }

  const opcionesDocumento = (tiposDocumento.data ?? []).map((tipo) => ({
    valor: tipo.codigo,
    texto: tipo.nombre,
  }));

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Registrar chofer</h2>

      <CampoSeleccion
        etiqueta="Tipo de documento"
        opciones={opcionesDocumento}
        value={valores.tipo_documento}
        onChange={(e) => setValores({ ...valores, tipo_documento: e.target.value as TipoDocumento })}
      />
      <Campo
        etiqueta="Numero de documento"
        placeholder="Ej. 5120478"
        value={valores.numero_documento}
        onChange={(e) => setValores({ ...valores, numero_documento: e.target.value })}
        required
      />
      <Campo
        etiqueta="Nombres"
        value={valores.nombres}
        onChange={(e) => setValores({ ...valores, nombres: e.target.value })}
        required
      />
      <Campo
        etiqueta="Apellidos"
        value={valores.apellidos}
        onChange={(e) => setValores({ ...valores, apellidos: e.target.value })}
        required
      />
      <Campo
        etiqueta="Numero de licencia"
        value={valores.numero_licencia}
        onChange={(e) => setValores({ ...valores, numero_licencia: e.target.value })}
        required
      />
      <Campo
        etiqueta="Categoria de licencia"
        placeholder="Ej. c"
        value={valores.categoria_licencia}
        onChange={(e) => setValores({ ...valores, categoria_licencia: e.target.value })}
        required
      />
      <Campo
        etiqueta="Vencimiento de la licencia"
        type="date"
        value={valores.fecha_vencimiento_licencia}
        onChange={(e) => setValores({ ...valores, fecha_vencimiento_licencia: e.target.value })}
        required
      />
      <Campo
        etiqueta="Celular (opcional)"
        placeholder="Ej. 70011223"
        value={valores.telefono ?? ''}
        onChange={(e) => setValores({ ...valores, telefono: e.target.value })}
      />

      <Boton type="submit" cargando={registrar.isPending}>
        Registrar
      </Boton>

      {registrar.error && (
        <p role="alert" className="text-red-600">
          {registrar.error.message}
        </p>
      )}
    </form>
  );
}
```

**9d. Detalle.** Distingue el 404 ("no existe") de otros errores usando `ErrorDeApi`.

```tsx
// archivo: web/src/modulos/choferes/componentes/DetalleChofer.tsx
'use client';

import Link from 'next/link';
import { InsigniaEstado } from '@/compartido/componentes/InsigniaEstado';
import { ErrorDeApi } from '@/compartido/servicios/clienteHttp';
import { useActualizarChofer } from '../hooks/useActualizarChofer';
import { useChofer } from '../hooks/useChoferes';

export function DetalleChofer({ id }: { id: string }) {
  const { data: chofer, isPending, error } = useChofer(id);
  const actualizar = useActualizarChofer(id);

  if (isPending) {
    return <p className="text-slate-500">Cargando chofer...</p>;
  }

  if (error instanceof ErrorDeApi && (error.estado === 404 || error.estado === 400)) {
    return (
      <p className="text-slate-600">
        Ese chofer no existe.{' '}
        <Link href="/admin/choferes" className="text-blue-700 underline">
          Volver a la lista
        </Link>
      </p>
    );
  }

  if (error) {
    return <p className="text-red-600">No se pudo cargar el chofer: {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          {chofer.nombres} {chofer.apellidos}
        </h2>
        <InsigniaEstado activo={chofer.activo} />
      </div>

      <dl className="grid grid-cols-[180px_1fr] gap-2 text-sm">
        <dt className="text-slate-500">Documento</dt>
        <dd>
          {chofer.tipo_documento.toUpperCase()} {chofer.numero_documento}
        </dd>
        <dt className="text-slate-500">Licencia</dt>
        <dd>
          {chofer.numero_licencia} · categoría {chofer.categoria_licencia}
        </dd>
        <dt className="text-slate-500">Vence</dt>
        <dd>{chofer.fecha_vencimiento_licencia}</dd>
        <dt className="text-slate-500">Celular</dt>
        <dd>{chofer.telefono ?? 'Sin registrar'}</dd>
      </dl>

      <button
        type="button"
        disabled={actualizar.isPending}
        onClick={() => actualizar.mutate({ activo: !chofer.activo })}
        className="w-fit rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {chofer.activo ? 'Desactivar chofer' : 'Activar chofer'}
      </button>

      {actualizar.error && (
        <p role="alert" className="text-red-600">
          {actualizar.error.message}
        </p>
      )}
    </div>
  );
}
```

---

### Paso 10 — Web: páginas

La **carpeta** define la URL. La página solo **acomoda componentes**: no pide datos ni llama a la API.

| Archivo | URL |
|---|---|
| `app/(backoffice)/admin/choferes/page.tsx` | `/admin/choferes` |
| `app/(backoffice)/admin/choferes/[id]/page.tsx` | `/admin/choferes/<id>` |

> Los paréntesis `(backoffice)` y `(publico)` **no aparecen en la URL**: solo agrupan páginas que comparten un layout.

```tsx
// archivo: web/src/app/(backoffice)/admin/choferes/page.tsx
import { FormularioChofer } from '@/modulos/choferes/componentes/FormularioChofer';
import { TablaChoferes } from '@/modulos/choferes/componentes/TablaChoferes';

export default function PaginaChoferes() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Choferes</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <TablaChoferes />
        </div>
        <FormularioChofer />
      </div>
    </section>
  );
}
```

La carpeta `[id]` es un **parámetro**. En Next.js 16, `params` llega como promesa y se lee con `await`:

```tsx
// archivo: web/src/app/(backoffice)/admin/choferes/[id]/page.tsx
import Link from 'next/link';
import { DetalleChofer } from '@/modulos/choferes/componentes/DetalleChofer';

export default async function PaginaDetalleChofer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <section className="flex flex-col gap-4">
      <Link href="/admin/choferes" className="text-sm text-blue-700 underline">
        ← Volver a choferes
      </Link>
      <DetalleChofer id={id} />
    </section>
  );
}
```

---

### Paso 11 — Web: agregar la opción al menú

En `web/src/compartido/componentes/MenuLateral.tsx`, agrega tu opción al arreglo `OPCIONES` (no borres las de otros) con los **roles** que la ven. El menú resalta solo la pantalla activa:

```tsx
// en: web/src/compartido/componentes/MenuLateral.tsx (agregar dentro de OPCIONES)
  { etiqueta: 'Choferes', ruta: '/admin/choferes', roles: ['administrador', 'vendedor', 'encomiendas'] },
```

> Los roles del menú solo **ocultan** la opción; quien protege los datos es la API (paso 4b). Pon en el menú los mismos roles que en `autorizacion.requiere(...)` del `GET`.

---

### Paso 12 — Verificar antes del PR

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

Y en el navegador: http://localhost:3000/admin/choferes → filtra, registra uno, entra al detalle, desactívalo. Si creaste datos de prueba, desactívalos o bórralos.

---

## 5. Recetas cortas

### 5.1 Agregar un endpoint a un módulo que ya existe

1. Ruta nueva en `shared/src/endpoints.ts` (y el tipo en `shared/src/tipos/` si hace falta).
2. Método nuevo en la interfaz `dominio/<Entidad>Repositorio.ts` → impleméntalo en `adaptadores/Pg<Entidad>Repositorio.ts` **y en el repositorio en memoria de las pruebas**.
3. Caso de uso nuevo en `casos-de-uso/` + su prueba.
4. Agrégalo a `casosDeUso` en `contenedor.ts`.
5. Ruta en `adaptadores/<entidad>Rutas.ts` (y añade el caso de uso al tipo del parámetro `casos`).
6. Web: función en el servicio → hook → componente.

### 5.2 Endpoint con `:id`

- En `shared`: dos formas de la misma ruta: `porId: '/v1/x/:id'` (Express) y `detalle: (id) => \`/v1/x/${id}\`` (web).
- En las rutas: `const { id } = z.object({ id: z.uuid() }).parse(req.params);`
- En el caso de uso: si no existe, lanza un error del dominio con `estadoHttp = 404`.

### 5.3 Filtros con `?parametro=valor`

- Rutas: `const { activo } = z.object({ activo: z.enum(['true','false']).optional() }).parse(req.query);`
- SQL: `where ($1::boolean is null or activo = $1)` con `[filtro.activo ?? null]`.
- Servicio: `new URLSearchParams({ activo: String(valor) })`.
- Hook: incluye el filtro en la clave de caché (`['x', 'lista', filtro]`).

### 5.4 Mostrar errores de la API en pantalla

```tsx
import { ErrorDeApi } from '@/compartido/servicios/clienteHttp';

if (error instanceof ErrorDeApi && error.estado === 409) {
  return <p>{error.message}</p>; // ej. "Ya existe un chofer con ese documento..."
}
```

`error.codigo` trae el código de la API (`chofer_duplicado`, `asiento_no_disponible`…) por si necesitas reaccionar distinto a cada caso.

### 5.5 Página del portal público

- Va dentro de `web/src/app/(publico)/` y **no** usa el menú del panel.
- Ejemplo: `app/(publico)/ayuda/page.tsx` → URL `/ayuda`.
- ⚠️ No puede haber **dos** `page.tsx` para la misma URL: `app/page.tsx` y `app/(publico)/page.tsx` chocan en `/` y `npm run build` falla. Deja solo uno.

### 5.6 Leer el `:id` de la URL dentro de un componente

Si no quieres pasarlo desde la página, en un componente cliente:

```tsx
'use client';

import { useParams } from 'next/navigation';

export function MiComponente() {
  const { id } = useParams<{ id: string }>();
  // ...usar id con un hook
}
```

### 5.7 Componentes reutilizables

- Si lo usa **un solo módulo** → `web/src/modulos/<modulo>/componentes/`.
- Si lo usan **varios** → `web/src/compartido/componentes/` (como `Boton`, `Campo`, `MenuLateral` o `InsigniaEstado`).
- Reciben datos por *props* y **no** llaman a la API.

### 5.8 Si tu tarjeta necesita cambiar la base de datos

- **No** crees ni modifiques tablas desde el panel de Supabase.
- **Avisa a John** antes: los cambios de esquema se hacen con una **migración nueva** en `supabase/migrations/` y la base es compartida.
- **Si el dato se puede calcular con otros que ya existen, no se guarda**: se lee de una vista (`ventas_totales`, `rutas_resumen`, `viajes_horarios`, `encomiendas_estado_actual`).
- Reglas del SQL: palabras en **minúsculas** (`create table`, `not null`), **nunca renombrar** campos existentes y activar RLS en tablas nuevas (`alter table x enable row level security;`).

---

## 6. Reglas que no se rompen

### 6.1 Checklist antes de pedir revisión

- [ ] `npm run lint`, `npm test` y `npm run build` sin errores
- [ ] Rutas y tipos nuevos declarados en `shared/src/`
- [ ] El dominio **no** importa `express`, `pg`, `zod` ni `@panamericana/shared`
- [ ] El caso de uso **no** recibe `req` ni `res`
- [ ] El SQL está **solo** en `Pg<Entidad>Repositorio.ts`, en minúsculas y con `$1, $2…`
- [ ] Los campos se llaman **igual** que en la base (`numero_documento`, no `numeroDocumento`)
- [ ] Los componentes **no** usan `fetch`: servicio → hook → componente
- [ ] La pantalla maneja **cargando, vacío y error**
- [ ] Datos de ejemplo **bolivianos** (CI, placas `1234ABC`, celulares de 8 dígitos, Bs)
- [ ] No hay `.env` ni contraseñas en el cambio

### 6.2 Errores comunes

| ❌ No hagas esto | Por qué | ✅ Haz esto |
|---|---|---|
| `fetch('http://localhost:4000/...')` en un componente | No se reutiliza y la URL queda escrita a mano | Servicio con `RUTAS_API` + hook |
| Escribir `'/v1/choferes'` a mano en la web | Si cambia la ruta, se rompe en silencio | `RUTAS_API.choferes.base` |
| SQL dentro de `choferRutas.ts` | Mezcla HTTP con base de datos | Moverlo al repositorio |
| `import { Pool } from 'pg'` en `dominio/` | Ata las reglas a la base | Usar la interfaz del repositorio |
| Validar reglas del negocio solo con Zod | La regla se pierde si otro caso de uso crea la entidad | Zod valida la forma; la entidad valida el negocio |
| `new PgChoferRepositorio()` dentro del caso de uso | Imposible de probar sin base | Crear las instancias solo en `contenedor.ts` |
| Renombrar `fecha_vencimiento_licencia` a `fechaVencimiento` | Rompe la correspondencia con la base y con la web | Mismo nombre en todas partes |
| Borrar líneas de otros en `endpoints.ts`, `index.ts`, `contenedor.ts`, `rutas.ts` o el menú | Rompe el trabajo de tus compañeros | Solo **agregar** tus líneas; PR pequeño y rápido |
| `npm install` dentro de `backend/` o `web/` | Rompe la instalación del proyecto | `npm install` en la raíz |
| Pegar la contraseña de la base en el código o en un chat | La base queda expuesta | Solo en `backend/.env` |

---

## 7. Cómo entregar tu tarjeta

```bash
git checkout dev/tu-nombre
```

```bash
git pull origin main
```

Trabaja, verifica (paso 12) y guarda:

```bash
git add .
```

```bash
git commit -m "feat(PAN-06): registrar y listar clientes"
```

```bash
git push
```

En GitHub: **Compare & pull request** hacia `main` → asigna revisor → pega el enlace en tu tarjeta de Trello → muévela a **Testing**.

| Autor | Revisor |
|---|---|
| John | Grisel |
| Ángel | John |
| Grisel (backend) | John |
| Grisel (frontend) | Brisa |
| Brisa | Karime |
| Karime | Brisa |

> Trae `main` a tu rama **todos los días** (`git pull origin main`): cuanto más vieja la rama, más conflictos.

---

## 8. Si usas un asistente de IA

Un asistente ayuda mucho, pero **no conoce las reglas de este proyecto**. Pega este bloque al inicio de la conversación y pídele que lo respete:

```text
Proyecto: Panamericana (Bolivia). Monorepo con npm workspaces.
- shared/src: endpoints.ts (RUTAS_API con base, porId y detalle) y tipos/. Es el contrato entre API y web.
- backend (Node 24, TypeScript, Express 5, Zod, pg con SQL a mano, sin ORM):
  backend/src/modulos/<modulo>/{dominio,casos-de-uso,adaptadores}.
  dominio: entidad con reglas, errores que extienden ErrorDeDominio (codigo, estadoHttp) e interfaz del repositorio.
  El dominio NO importa express, pg, zod ni @panamericana/shared.
  casos-de-uso: una clase por accion con metodo ejecutar(); reciben objetos simples, nunca req/res; prueba con Vitest y repositorio en memoria.
  adaptadores: Pg<Entidad>Repositorio (unico lugar con SQL, palabras SQL en minusculas, parametros $1) y <entidad>Rutas (Router + Zod, sin try/catch).
  contenedor.ts es el unico lugar con "new"; rutas.ts registra los routers.
- web (Next.js 16 App Router, React, Tailwind, TanStack Query):
  web/src/modulos/<modulo>/{servicios,hooks,componentes}; paginas en web/src/app/(backoffice)/admin/... o (publico)/...
  Los componentes nunca usan fetch: servicio (clienteHttp + RUTAS_API) -> hook (useQuery/useMutation) -> componente.
  Componentes con hooks llevan 'use client'. En page.tsx, params es una Promise.
- Los nombres de campos son IDENTICOS a la base de datos (snake_case). No renombrar.
- Base normalizada: los datos personales viven en la tabla "personas" y usuarios, clientes y choferes la enlazan con persona_id (join en el repositorio).
- Las listas de valores son catalogos (tipos_documento, tipos_asiento, roles, metodos_pago, canales_venta, categorias_licencia, departamentos, ciudades) y guardan el codigo legible: ci, cama, taquilla.
- Lo que se puede calcular NO se guarda: total de una venta, duracion de una ruta, hora de llegada y estado de una encomienda se leen de vistas.
- Todo endpoint del panel lleva autorizacion.requiere(...ROLES) de compartido/adaptadores/http/autorizacion.ts; el router recibe (casos, autorizacion). Solo catalogos, busqueda de viajes y compra del portal son publicos.
- Reutilizar lo compartido, no copiarlo: backend/src/compartido/dominio/Persona.ts (crearPersona: reglas de CI y celular), compartido/adaptadores/pg (enTransaccion, guardarPersona, CODIGOS_PG), web/src/compartido/componentes (Boton, Campo, CampoSeleccion, MenuLateral) y modulos/catalogos (useCiudades, useTiposDocumento).
- Datos bolivianos: documentos ci/ce/pasaporte, placas 1234ABC, celulares de 8 digitos, montos en bolivianos.
- No crear tablas ni cambiar el esquema: eso se coordina aparte.
Sigue el mismo patron del modulo "buses" que ya existe.
```

**Pídele cosas concretas:** *"Siguiendo ese patrón, crea el caso de uso `ListarTerminales` y su prueba"*.

**Desconfía y revisa** si el asistente:
- propone instalar un ORM (Prisma, TypeORM), NestJS u otra librería grande;
- pone SQL o `fetch` fuera de su lugar;
- cambia nombres de campos a *camelCase*;
- modifica archivos de otros módulos o borra líneas de `endpoints.ts`, `contenedor.ts` o `rutas.ts`;
- crea archivos `.md`, carpetas nuevas en la raíz o cambia la configuración (`tsconfig`, `eslint`, `package.json`) sin que lo pidas.

> El código lo entregas tú: **entiende cada línea** antes de hacer commit. Si no la entiendes, pregunta en el grupo.

---

## 9. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `getaddrinfo ENOTFOUND db.….supabase.co` | Usas la conexión directa | Usa la `DATABASE_URL` del pooler (sección 1.3) |
| `tenant or user not found` | Usuario o host mal copiado | Usuario `postgres.tvyhpwpyxmbdfxogopnl` y host `aws-0-us-east-1` |
| `Falta la variable de entorno DATABASE_URL` | No existe `backend/.env` | Créalo (sección 1.3) |
| `Cannot find module '@panamericana/shared'` | Instalaste dentro de una subcarpeta | Borra ese `node_modules` y haz `npm install` en la raíz |
| La web no ve un tipo o ruta nueva de `shared` | `shared` no se recompiló | `npm run build:shared` o reinicia `dev:*` |
| "No se pudo cargar la lista" en la web | El backend no está corriendo | `npm run dev:backend` en otra terminal |
| Error de CORS en la consola del navegador | La web no corre en el 3000 o falta `ALLOWED_ORIGINS` | Revisa `ALLOWED_ORIGINS=http://localhost:3000` |
| La lista no se actualiza al guardar | La mutación no invalida la caché | `invalidateQueries({ queryKey: claves.todos })` en `onSuccess` |
| `You cannot have two parallel pages that resolve to the same path` | Dos `page.tsx` para la misma URL | Deja solo uno (receta 5.5) |
| `invalid input syntax for type uuid` (500) | El `:id` no se validó | `z.object({ id: z.uuid() }).parse(req.params)` |
| La fecha llega como `2028-05-31T04:00:00.000Z` | Columna `date` leída sin convertir | Pedirla como `columna::text` en el `select` |
| Un monto llega como texto (`"80.00"`) | PostgreSQL devuelve `numeric` como texto | `Number(fila.precio)` al reconstruir la entidad |
| `violates check constraint` al guardar | Valor fuera de la lista permitida (ej. `dni`) | Usa los valores aceptados (`ci`, `ce`, `pasaporte`) |
| Conflictos al hacer `git pull origin main` | Dos personas tocaron la misma línea | Conserva **ambas** líneas (la tuya y la del compañero) y vuelve a probar |

---

## 10. Chuleta de comandos

| Comando (desde la raíz) | Qué hace |
|---|---|
| `npm install` | Instala todo (solo en la raíz) |
| `npm run dev:backend` | API en http://localhost:4000 |
| `npm run dev:web` | Web en http://localhost:3000 |
| `npm run db:verificar` | Prueba la conexión a la base |
| `npm test` | Pruebas del backend |
| `npm run lint` | Revisa el estilo del código |
| `npm run build` | Compila todo como en la integración continua |
| `npm run build:shared` | Recompila solo `shared` |
| `npm run db:demo` | Crea los viajes de la semana para probar la compra |
| `npm run test:integracion` | Pruebas contra la base real (archivos `*.integracion.test.ts`; borran solo lo que crean) |
| `npm run prueba:humo` | Recorre la API sin escribir datos (con `CLAVE_DEMO` prueba tambien el panel) |
| `npm run prueba:seguridad` | Revisa RLS, CORS, secretos y rutas cerradas antes de presentar |
| `npm run ml:entrenar` | Reentrena el modelo de demanda |
| `git checkout dev/tu-nombre` | Cambia a tu rama |
| `git pull origin main` | Trae lo último de `main` a tu rama |
