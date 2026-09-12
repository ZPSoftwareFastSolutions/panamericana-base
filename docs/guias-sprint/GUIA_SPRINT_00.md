# Guía del Sprint 0 — Fundaciones

> **Sprint:** 0 · **Fechas:** 14/09/2026 → 25/09/2026
> **Para:** Ángel (montaje del repositorio) y todo el equipo (tareas)
> **Objetivo:** que los 5 integrantes tengan el proyecto corriendo en su computadora, conectado a la base de datos real, y que cada uno entregue su primer módulo siguiendo la arquitectura.

---

## Parte A — Montaje del repositorio (lo hace Ángel)

### A0. Antes de empezar

| Necesitas | Cómo verificar |
|---|---|
| Node.js 24 LTS | `node -v` |
| Git | `git --version` |
| Cuenta de GitHub | — |
| Contraseña de la base de datos | La tiene John; se comparte por canal privado |
| Los archivos base | Carpeta del repositorio 1 en tu computadora |

⏱️ Tiempo estimado del montaje completo: **45 minutos**.

---

### A1. Crear la carpeta del repositorio 2

```bash
mkdir "F:\Universidad\6to\Proyecto III\panamericana"
```

```bash
cd "F:\Universidad\6to\Proyecto III\panamericana" && git init -b main
```

> ⚠️ **Fuera** de la carpeta `project_bus`, nunca dentro.

---

### A2. Traer los archivos base

Desde PowerShell:

```powershell
robocopy "F:\Universidad\6to\Proyecto III\project_bus" "F:\Universidad\6to\Proyecto III\panamericana" /E /XD ".git" "node_modules" "dist" ".next" ".claude" "guias-sprint" /XF ".env" ".env.local" "REPLICACION_REPO2.md" "PLANIFICACION.md" "CLAUDE.md" "AGENTS.md" ".mcp.json"
```

`robocopy` termina con un código distinto de 0 aunque todo salga bien; eso es normal.

**Después de copiar:**

1. Abre `README.md` y borra estas dos líneas del inicio:
   ```
   > **Repositorio privado de trabajo (Repositorio 1).** Acceso: John Zabaleta y Ángel Paredes.
   > El repositorio del equipo completo es el **Repositorio 2** (ver REPLICACION_REPO2.md).
   ```
   y la fila de `REPLICACION_REPO2.md` de la tabla de documentación.

2. Crea la carpeta `docs/guias-sprint/` y copia **solo este archivo** (`GUIA_SPRINT_00.md`) dentro.

3. Agrega la versión adaptada de `PLANIFICACION.md` que te pase John (sin las secciones internas).

**Verifica que NO existan** (si aparecen, bórralos):

```bash
ls -a | grep -E "^\.claude|^CLAUDE.md|^AGENTS.md|^.mcp.json|^REPLICACION"
```

---

### A3. Instalar y comprobar que todo funciona

```bash
npm install
```

Un solo `npm install` en la raíz instala `shared`, `backend` y `web`. **Nunca** lo ejecutes dentro de esas carpetas.

```bash
npm run build
```

```bash
npm test
```

Deben pasar las 3 pruebas del módulo `buses`.

---

### A4. Conectar la base de datos

```bash
cp backend/.env.example backend/.env
```

```bash
cp web/.env.local.example web/.env.local
```

Abre `backend/.env` y completa **solo** `DATABASE_URL`, reemplazando `CONTRASENA`:

```
DATABASE_URL=postgresql://postgres.tvyhpwpyxmbdfxogopnl:CONTRASENA@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

> 🔌 Es la cadena del **Session pooler** y está verificada. No uses la conexión directa (`db.tvyhpwpyxmbdfxogopnl.supabase.co`): es solo IPv6 y falla con `getaddrinfo ENOTFOUND`. Fíjate que el usuario lleva la referencia del proyecto: `postgres.tvyhpwpyxmbdfxogopnl`.

Comprueba la conexión:

```bash
npm run db:verificar
```

Debe responder algo así:

```
Conexion correcta: PostgreSQL 17.6 on x86_64-pc-linux-gnu
Tablas (16): asientos, buses, choferes, clientes, encomiendas, historial_encomiendas, pagos,
             pasajes, rutas, rutas_paradas, tarifas, terminales, usuarios, ventas, viajes, viajes_choferes
Buses registrados: 2
```

---

### A5. Ver el sistema funcionando

En dos terminales:

```bash
npm run dev:backend
```

```bash
npm run dev:web
```

| Comprobación | Dónde | Qué debes ver |
|---|---|---|
| API viva | http://localhost:4000/salud | `{"estado":"ok"}` |
| API con datos | http://localhost:4000/v1/buses | Los 2 buses de prueba |
| Web | http://localhost:3000 | Portada |
| Panel | http://localhost:3000/admin/buses | Tabla con 2 buses y el formulario |

**Prueba de humo:** registra un bus desde el formulario. Debe aparecer en la tabla sin recargar la página. Si repites la misma placa, debe salir el mensaje "Ya existe un bus con la placa…". Borra después ese bus de prueba desde el panel de Supabase.

---

### A6. Subir el repositorio a GitHub

1. GitHub → **New repository** → nombre `panamericana` → **Private** → sin README ni .gitignore → Create.

```bash
git remote add origin https://github.com/TU-USUARIO/panamericana.git
```

```bash
git add .
```

Antes de confirmar, revisa que **no** aparezca ningún `.env`:

```bash
git status --short
```

```bash
git commit -m "chore: estructura base del proyecto"
```

```bash
git push -u origin main
```

---

### A7. Invitar al equipo y proteger `main`

**Settings → Collaborators → Add people:** John, Grisel, Brisa y Karime con permiso **Write**.

**Settings → Branches → Add branch protection rule**, patrón `main`:

- [x] Require a pull request before merging → **1 aprobación**
- [x] Require status checks to pass (marca el check `Lint, pruebas y build` cuando aparezca)
- [x] Require conversation resolution before merging

---

### A8. Crear las ramas de cada integrante

```bash
git checkout -b dev/angel main && git push -u origin dev/angel
```

```bash
git checkout -b dev/john main && git push -u origin dev/john
```

```bash
git checkout -b dev/grisel main && git push -u origin dev/grisel
```

```bash
git checkout -b dev/brisa main && git push -u origin dev/brisa
```

```bash
git checkout -b dev/karime main && git push -u origin dev/karime
```

```bash
git checkout main
```

---

### A9. Mensaje para el equipo (copiar y pegar)

> **Panamericana — cómo levantar el proyecto**
>
> 1. Instala Node.js 24 LTS.
> 2. `git clone https://github.com/TU-USUARIO/panamericana.git`
> 3. `cd panamericana` y `npm install` (en la raíz, nunca dentro de backend o web).
> 4. `cp backend/.env.example backend/.env` y `cp web/.env.local.example web/.env.local`
>    En PowerShell: `Copy-Item backend\.env.example backend\.env`
> 5. En `backend/.env`, pega la `DATABASE_URL` que te paso por privado.
> 6. `npm run db:verificar` → debe decir "Conexion correcta" y listar 16 tablas.
> 7. En dos terminales: `npm run dev:backend` y `npm run dev:web`.
> 8. Abre http://localhost:3000/admin/buses y registra un bus de prueba.
> 9. Lee `ARQUITECTURA_CLEAN.md` completo antes de escribir código. El módulo `buses` es el ejemplo a copiar.
> 10. Trabaja en tu rama: `git checkout dev/tu-nombre`
>
> Nunca subas el archivo `.env`. Nunca ejecutes `npm install` dentro de `backend/` o `web/`.

---

## Parte B — Tareas del Sprint 0

### B0. Tarea de todos (obligatoria, primero)

| Tarjeta | Descripción | Puntos |
|---|---|---|
| **PAN-01** | Entorno levantado: la web muestra los buses y `npm run db:verificar` responde | 1 |

**Criterio de aceptación:** capturas de `npm run db:verificar` y de la pantalla `/admin/buses` en la tarjeta de Trello.

### B1. Reparto

| Tarjeta | Responsable | Trabajo | Puntos |
|---|---|---|---|
| **PAN-02** | Ángel | Montaje del repositorio, ramas, colaboradores y tablero de Trello | 3 |
| **PAN-03** | Ángel | Módulo `terminales` en el backend (listar y registrar) | 3 |
| **PAN-04** | John | Módulo `usuarios` en el backend (listar y registrar) | 3 |
| **PAN-05** | John | Revisar los PR de los demás y dejar la CI en verde | 2 |
| **PAN-06** | Grisel | Módulo `clientes` de punta a punta: API + pantalla del backoffice | 5 |
| **PAN-07** | Brisa | Pantalla de terminales en el backoffice + opciones del menú lateral | 5 |
| **PAN-08** | Karime | Estructura `app/(publico)/` + maqueta del buscador de viajes | 5 |

### B2. Detalle de cada tarjeta

#### PAN-03 · Terminales (backend) — Ángel

Campos de la tabla `terminales`: `id`, `nombre` (único), `ciudad`, `direccion`, `activo`.

| # | Archivo |
|---|---|
| 1 | `shared/src/tipos/terminal.ts` y exportarlo en `shared/src/index.ts` |
| 2 | `shared/src/endpoints.ts` → agregar `terminales: { base: '/v1/terminales', porId: '/v1/terminales/:id', detalle: (id) => ... }` |
| 3 | `backend/src/modulos/terminales/dominio/` → `Terminal.ts`, `TerminalRepositorio.ts`, `errores.ts` |
| 4 | `backend/src/modulos/terminales/casos-de-uso/` → `RegistrarTerminal.ts` + su `.test.ts`, `ListarTerminales.ts` |
| 5 | `backend/src/modulos/terminales/adaptadores/` → `PgTerminalRepositorio.ts`, `terminalRutas.ts` |
| 6 | `backend/src/contenedor.ts` y `backend/src/rutas.ts` |
| 7 | `docs/api/openapi.yaml` |

**Reglas de negocio para el dominio:** el nombre no puede estar vacío; no se permiten dos terminales con el mismo nombre (`NombreDuplicadoError` → 409).

**Criterio de aceptación:** `curl http://localhost:4000/v1/terminales` devuelve las 3 terminales de prueba, y registrar una repetida responde 409.

#### PAN-04 · Usuarios (backend) — John

Campos de `usuarios`: `id`, `nombres`, `apellidos`, `correo` (único), `rol`, `activo`.

Mismos 7 pasos que PAN-03, con módulo `usuarios`.

**Reglas de negocio:** el correo debe tener formato válido y ser único (`CorreoDuplicadoError` → 409); `rol` solo puede ser `administrador`, `vendedor`, `encomiendas` o `cliente` (`RolInvalidoError` → 400).

**Criterio de aceptación:** listar devuelve los 2 usuarios de prueba; registrar con un rol inventado responde 400.

#### PAN-06 · Clientes de punta a punta — Grisel

Campos de `clientes`: `id`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `telefono`, `correo`, `fecha_nacimiento`.

**Backend:** los mismos 7 pasos de PAN-03, con módulo `clientes`.
**Reglas:** `tipo_documento` solo `dni`, `ce` o `pasaporte`; si es `dni`, `numero_documento` debe tener 8 dígitos; no se repite la pareja tipo + número (409).

**Frontend:**

| # | Archivo |
|---|---|
| 1 | `web/src/modulos/clientes/servicios/clientesServicio.ts` |
| 2 | `web/src/modulos/clientes/hooks/useClientes.ts` y `useRegistrarCliente.ts` |
| 3 | `web/src/modulos/clientes/componentes/TablaClientes.tsx` y `FormularioCliente.tsx` |
| 4 | `web/src/app/(backoffice)/admin/clientes/page.tsx` |

**Criterio de aceptación:** desde `/admin/clientes` se registra un cliente y aparece en la tabla; un documento repetido muestra el mensaje de error de la API.

#### PAN-07 · Pantalla de terminales + menú — Brisa

| # | Archivo |
|---|---|
| 1 | `web/src/modulos/terminales/servicios/terminalesServicio.ts` |
| 2 | `web/src/modulos/terminales/hooks/useTerminales.ts` y `useRegistrarTerminal.ts` |
| 3 | `web/src/modulos/terminales/componentes/TablaTerminales.tsx` y `FormularioTerminal.tsx` |
| 4 | `web/src/app/(backoffice)/admin/terminales/page.tsx` |
| 5 | `web/src/app/(backoffice)/layout.tsx` → agregar Terminales y Clientes al menú, y marcar la opción activa |

**Criterio de aceptación:** las tres pantallas (buses, terminales, clientes) se alcanzan desde el menú; cada una maneja los estados cargando, error y lista vacía.

> Mientras Ángel no termine PAN-03, trabaja con el endpoint que aún no existe: la pantalla debe mostrar el estado de error sin romperse. Cuando el endpoint esté listo, funciona sola.

#### PAN-08 · Portal público (maqueta) — Karime

| # | Archivo |
|---|---|
| 1 | `web/src/app/(publico)/layout.tsx` → cabecera y pie del portal |
| 2 | `web/src/app/(publico)/page.tsx` → portada con el buscador |
| 3 | `web/src/modulos/viajes/componentes/BuscadorViajes.tsx` → origen, destino y fecha (sin API todavía) |
| 4 | `web/src/compartido/componentes/` → `Boton.tsx` y `Campo.tsx` reutilizables |

**Criterio de aceptación:** la portada se ve bien en celular y en computadora; el buscador valida que origen y destino sean distintos. Todavía no llama a la API.

### B3. Cómo se entrega cada tarjeta

```bash
git checkout dev/tu-nombre && git pull origin main
```

Trabaja, y al terminar:

```bash
git add . && git commit -m "feat: listar y registrar terminales"
```

```bash
git push
```

En GitHub: **Compare & pull request** hacia `main`, pide revisión al compañero que corresponde y pega el enlace en la tarjeta de Trello.

| Autor | Revisor |
|---|---|
| John | Grisel |
| Ángel | John |
| Grisel (backend) | John |
| Grisel (frontend) | Brisa |
| Brisa | Karime |
| Karime | Brisa |

---

## Parte C — Checklist de cierre del Sprint 0

- [ ] Los 5 integrantes levantaron el proyecto y lo conectaron a la base
- [ ] Las 5 ramas `dev/*` existen y `main` está protegida
- [ ] La CI pasa en verde en cada PR
- [ ] Módulos `terminales`, `usuarios` y `clientes` funcionando
- [ ] Pantallas de terminales y clientes accesibles desde el menú
- [ ] Portal público con su maqueta del buscador
- [ ] `docs/api/openapi.yaml` incluye todos los endpoints nuevos
- [ ] Ningún `.env` subido al repositorio
- [ ] Tablero de Trello con el backlog del Sprint 1 listo

---

## Parte D — Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `getaddrinfo ENOTFOUND db.tvyhpwpyxmbdfxogopnl.supabase.co` | Usaste la conexión directa (IPv6) | Usa la cadena del Session pooler de A4 |
| `tenant or user not found` | Falta la referencia en el usuario | El usuario es `postgres.tvyhpwpyxmbdfxogopnl`, no `postgres` |
| `Falta la variable de entorno DATABASE_URL` | No creaste `backend/.env` | Repite el paso A4 |
| `Cannot find module '@panamericana/shared'` | Instalaste dentro de una subcarpeta | Borra ese `node_modules` y ejecuta `npm install` en la raíz |
| La web dice "No se pudo cargar la lista" | El backend no está levantado | Abre otra terminal con `npm run dev:backend` |
| La web no toma un cambio del contrato | `shared` no se recompiló | `npm run build:shared` |
| El formulario no muestra los datos nuevos | Falta invalidar la cache | Revisa `onSuccess` en el hook de mutación |
| `error: permission denied for table X` | Estás usando la clave pública en vez de la conexión de Postgres | Los datos se leen **solo** por la API |

---

## Parte E — Recordatorio de reglas

1. `npm install` **solo en la raíz**.
2. Las direcciones de la API se declaran **solo** en `shared/src/endpoints.ts`.
3. Los componentes **nunca** usan `fetch`: servicio → hook → componente.
4. El SQL va **solo** en `Pg<Entidad>Repositorio.ts`, en minúsculas.
5. Los nombres de los campos **no se cambian**: `numero_pisos` en la base, en el backend y en la web.
6. Cambios de esquema **solo por migraciones**, nunca desde el panel de Supabase.
7. Nadie trabaja directamente en `main`.
8. Trae `main` a tu rama **todos los días**.
