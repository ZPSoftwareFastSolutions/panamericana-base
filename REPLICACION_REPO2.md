# Replicación al Repositorio 2 (repositorio del equipo)

> **Versión:** 0.3 · **Fecha:** 2026-09-14
> **Documento interno del Repositorio 1.** No se copia al Repositorio 2.
> **Regla principal:** el Repositorio 2 lleva **solo el stack** y un `README.md` básico. Ningún otro `.md`.

---

## 1. Los dos repositorios

| | **Repositorio 1** | **Repositorio 2** |
|---|---|---|
| Nombre | `panamericana-base` | `panamericana` |
| Dueño | Z&P (John + Ángel) | Ángel |
| Acceso | John, Ángel | Los 5 integrantes |
| Visibilidad | Privado | Privado |
| Propósito | Construir y validar la base técnica | Desarrollo del equipo completo |
| Herramientas de IA | Sí | No |
| Ruta local | `F:\Universidad\6to\Proyecto III\project_bus` | **Otra carpeta**, fuera de esa ruta |

```mermaid
flowchart LR
    R1["Repositorio 1<br/>base validada"] -->|"guía de sprint<br/>+ archivos base"| R2["Repositorio 2<br/>desarrollo del equipo"]
    R2 -.->|"solo observaciones,<br/>nunca código automático"| R1
```

**Nunca hay conexión automática entre ambos:** ni remotos cruzados, ni `git push`, ni submódulos. La transferencia es manual y consciente.

---

## 2. Reglas de aislamiento

| # | Regla | Por qué |
|---|---|---|
| **A1** | El Repositorio 2 vive en **otra carpeta** del disco, fuera de `project_bus` | Evita que una herramienta que trabaja en el Repositorio 1 lo alcance |
| **A2** | El Repositorio 2 **nunca** se abre como directorio de trabajo de Claude Code ni de otro asistente | Es el requisito principal |
| **A3** | El Repositorio 1 **no** tiene al Repositorio 2 como remoto (`git remote -v` solo muestra su propio `origin`) | Evita un `push` accidental |
| **A4** | El Repositorio 2 **no contiene ningún `.md`** salvo un `README.md` básico de proyecto amateur (plantilla: `docs/repo2/README.md`). Tampoco `docs/`, `.claude/`, `.mcp.json` ni `.git/` | El proyecto del grupo debe verse como un proyecto normal: solo el stack |
| **A5** | Los dos repositorios comparten el proyecto de Supabase `panamericana`, pero **los archivos `.env` nunca se copian**: cada persona pone sus credenciales a mano | Compartir datos es intencional; compartir archivos con claves, no |
| **A6** | La transferencia es por **copia de archivos**, nunca por historial de Git | El Repositorio 2 tiene su propio historial, hecho por el equipo |
| **A7** | Antes de copiar, se revisa que ningún archivo tenga claves ni rutas locales | Ver checklist de la sección 6 |

---

## 3. Crear el Repositorio 2 (lo hace Ángel)

### 3.1 Carpeta local

```bash
mkdir "F:\Universidad\6to\Proyecto III\panamericana"
```

```bash
cd "F:\Universidad\6to\Proyecto III\panamericana" && git init -b main
```

> ⚠️ La carpeta debe estar **fuera** de `project_bus`, nunca dentro.

### 3.2 Repositorio remoto

En GitHub: **New repository** → nombre `panamericana` → **Private** → sin README ni .gitignore → Create.

```bash
git remote add origin https://github.com/<usuario-de-angel>/panamericana.git
```

### 3.3 Invitar al equipo

**Settings → Collaborators → Add people:** John, Grisel, Brisa y Karime con permiso **Write**.

### 3.4 Proteger `main`

**Settings → Branches → Add branch protection rule** para `main`:

- [x] Require a pull request before merging → **1 aprobación**
- [x] Require status checks to pass (una vez que la CI corra)
- [x] Require conversation resolution before merging

---

## 4. Qué se copia y qué no

**Regla:** el Repositorio 2 lleva **solo el stack**. Ningún `.md`, excepto un `README.md` básico.

| Archivo o carpeta | ¿Se copia? |
|---|---|
| `package.json`, `package-lock.json` | ✅ Sí |
| `shared/`, `backend/`, `web/` (sin `node_modules`, `dist` ni `.next`) | ✅ Sí |
| `supabase/migrations/`, `supabase/seed.sql` | ✅ Sí |
| `.gitignore`, `.gitattributes`, `.editorconfig`, `.prettierrc`, `.nvmrc` | ✅ Sí |
| `.github/workflows/ci.yml` | ✅ Sí |
| `docs/repo2/README.md` | ✅ Se copia **como `README.md` en la raíz** |
| Cualquier otro `.md`: `README.md` de este repositorio, `CLAUDE.md`, `PLANIFICACION.md`, `ARQUITECTURA_CLEAN.md`, `PROPUESTA_BD.md`, este documento, `.github/pull_request_template.md` | ❌ Nunca |
| `docs/` completa: ADR, guías de sprint, `openapi.yaml`, plantillas | ❌ Nunca |
| `.claude/`, `.mcp.json`, `AGENTS.md` | ❌ Nunca |
| `.env`, `.env.local` | ❌ Nunca |
| `node_modules/`, `dist/`, `.next/`, `.git/` | ❌ Se regeneran |

### 4.1 Comando de copia (PowerShell)

```powershell
robocopy "F:\Universidad\6to\Proyecto III\project_bus" "F:\Universidad\6to\Proyecto III\panamericana" /E /XD ".git" "node_modules" "dist" ".next" ".claude" "docs" /XF "*.md" ".env" ".env.local" ".mcp.json"
```

`/XF "*.md"` excluye **todos** los `.md` de todas las carpetas. Después se copia el README básico:

```powershell
Copy-Item "F:\Universidad\6to\Proyecto III\project_bus\docs\repo2\README.md" "F:\Universidad\6to\Proyecto III\panamericana\README.md"
```

Comprobar que el único `.md` es el README (debe listar **un solo archivo**):

```powershell
Get-ChildItem "F:\Universidad\6to\Proyecto III\panamericana" -Recurse -Filter *.md | Select-Object FullName
```

### 4.2 Verificar que la base funciona antes del primer commit

```bash
npm install
```

```bash
npm run build
```

```bash
npm test
```

Si los tres pasan, la base está sana.

### 4.3 Primer commit

```bash
git add .
```

```bash
git commit -m "chore: estructura base del proyecto"
```

```bash
git push -u origin main
```

---

## 5. Configuración de entorno del Repositorio 2

### 5.1 Supabase compartido

Los dos repositorios usan **el mismo proyecto**, así que el equipo de 5 y nosotros vemos los mismos datos.

| Dato | Valor |
|---|---|
| Proyecto | `panamericana` |
| Referencia | `tvyhpwpyxmbdfxogopnl` |
| URL | `https://tvyhpwpyxmbdfxogopnl.supabase.co` |
| Región | `us-east-1` |
| Estado | 16 tablas creadas, con datos de prueba |

**Lo que NO se comparte por el repositorio:** la contraseña de la base de datos y la cadena de conexión. Cada integrante las copia del panel de Supabase:

**Cadena de conexión verificada** (solo falta la contraseña):

```
postgresql://postgres.tvyhpwpyxmbdfxogopnl:CONTRASENA@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

| Dato | Dónde está |
|---|---|
| Contraseña de la base | La comparte Ángel por canal privado (o Supabase → Project Settings → Database → *Reset password*) |
| Claves de la API | Supabase → Project Settings → API |

> 🔌 **No usar la conexión directa** (`db.tvyhpwpyxmbdfxogopnl.supabase.co`): es solo IPv6 y falla con `getaddrinfo ENOTFOUND`. El *Session pooler* es IPv4 y sí funciona. Ojo que el usuario lleva la referencia del proyecto: `postgres.tvyhpwpyxmbdfxogopnl`.

> ⚠️ Como es una base compartida, el Repositorio 1 **no hace cargas masivas de datos**. El espacio es del equipo de 5 para sus pruebas de CRUD.

### 5.2 Pasos para cada integrante

| # | Paso | Comando |
|---|---|---|
| 1 | Clonar | `git clone https://github.com/<usuario-de-angel>/panamericana.git` |
| 2 | Verificar Node 24 | `node -v` |
| 3 | Instalar (en la raíz) | `npm install` |
| 4 | Variables del backend | `cp backend/.env.example backend/.env` |
| 5 | Variables de la web | `cp web/.env.local.example web/.env.local` |
| 6 | Completar `backend/.env` | `DATABASE_URL` del panel de Supabase (sección 5.1) |
| 7 | Levantar | `npm run dev:backend` y `npm run dev:web` |
| 8 | Verificar la base | `npm run db:verificar` |
| 9 | Verificar en el navegador | http://localhost:4000/salud y http://localhost:3000/admin/buses |

### 5.3 Migraciones

```bash
npx supabase link --project-ref tvyhpwpyxmbdfxogopnl
```

```bash
npx supabase db push
```

---

## 6. Checklist antes de publicar cualquier copia

- [ ] El único `.md` es `README.md` (la versión básica de `docs/repo2/`)
- [ ] No existe la carpeta `docs/`
- [ ] No existen `.claude/`, `CLAUDE.md`, `AGENTS.md`, `.mcp.json` ni `.github/pull_request_template.md`
- [ ] No hay archivos `.env` ni `.env.local` (solo los `.example`)
- [ ] No hay claves, contraseñas ni cadenas de conexión con contraseña
- [ ] Ningún archivo menciona documentos internos. Después de `git add .`, este comando **no debe devolver nada**:

  ```bash
  git grep --cached -nEi "ADR-|PROPUESTA_BD|ARQUITECTURA_CLEAN|PLANIFICACION|REPLICACION|claude"
  ```

- [ ] `git log` del Repositorio 2 muestra solo sus propios commits
- [ ] `git remote -v` no cruza los dos repositorios
- [ ] `npm install`, `npm run build` y `npm test` funcionan en una carpeta recién clonada

---

## 7. Ramas del Repositorio 2

Una rama por integrante para avanzar sus tareas, y `main` siempre estable.

```
main ────●──────────●──────────●────  (protegida, solo por PR)
          \        /  \       /
 dev/john  ●──●───●    ●──●──●
 dev/brisa ●────●─●
```

| Rama | Dueño |
|---|---|
| `main` | Protegida. Solo se actualiza con PR aprobado |
| `dev/angel` | Ángel |
| `dev/john` | John |
| `dev/grisel` | Grisel |
| `dev/brisa` | Brisa |
| `dev/karime` | Karime |

**Crear la rama propia:**

```bash
git checkout -b dev/john main
```

```bash
git push -u origin dev/john
```

**Rutina diaria de cada integrante:**

```bash
git checkout dev/john && git pull origin main
```

Al terminar una tarjeta: subir la rama, abrir un **Pull Request hacia `main`**, pedir revisión al compañero que corresponda y, una vez fusionado, el resto actualiza su rama con `git pull origin main`.

**Reglas:**

1. Nadie trabaja directamente en `main`.
2. Cada quien toca **solo sus módulos** (`backend/src/modulos/<suyo>`, `web/src/modulos/<suyo>`). Así casi no hay conflictos.
3. Los archivos compartidos (`shared/src/endpoints.ts`, `backend/src/rutas.ts`, `backend/src/contenedor.ts`, `web/src/app/(backoffice)/layout.tsx`) se tocan en cambios pequeños y se fusionan rápido, para que no se peleen dos ramas por la misma línea.
4. Traer `main` a la rama propia **todos los días**: cuanto más vieja la rama, peor el conflicto.

---

## 8. Ciclo de sincronización por sprint

```
Repo 1: se construye y valida el sprint N
        ↓
Se escribe docs/guias-sprint/GUIA_SPRINT_N.md   (se queda en el Repo 1)
        ↓
Se autoriza avanzar
        ↓
Ángel copia al Repo 2 solo el código base nuevo (si lo hay)
y crea las tarjetas de Trello a partir de la guía
        ↓
El equipo (5) desarrolla el sprint N en sus ramas
        ↓
Diferencias encontradas  →  se anotan en docs/guias-sprint/DIFERENCIAS.md (Repo 1)
```

### 8.1 Cómo llega la guía al equipo

La guía **nunca se copia** al Repositorio 2. Su contenido se convierte en **tarjetas de Trello**: cada tarjeta lleva la descripción, los archivos a crear, las reglas de negocio y el criterio de aceptación.

**La tarjeta explica *qué* construir y *en qué orden*, no entrega el código resuelto.** Cada integrante escribe su parte.

### 8.2 Qué mantiene uniforme el código sin documentos

| Acuerdo | Dónde lo ve el equipo |
|---|---|
| Estructura de carpetas y capas | El módulo `buses` y los comentarios del código |
| Direcciones y tipos de la API | `shared/src/` |
| Nombres de los datos | Las migraciones en `supabase/migrations/` |
| Reglas de calidad | La CI (`lint`, `test`, `build`) y la revisión de cada PR |

---

## 9. Errores a evitar

| ❌ Error | Consecuencia | ✅ En su lugar |
|---|---|---|
| `git remote add repo2 ...` en el Repositorio 1 | Un `push` accidental mezcla los repositorios | Copiar archivos manualmente |
| Copiar la carpeta `.git` | El Repositorio 2 hereda todo el historial | `robocopy` con `/XD ".git"` |
| Copiar `.env` | Se filtran claves de la base de datos | Copiar solo `.env.example` |
| Copiar `node_modules` | Copia lentísima y rota | Excluirla y ejecutar `npm install` |
| Copiar cualquier `.md` o la carpeta `docs/` | El proyecto del grupo deja de verse como un proyecto normal | `robocopy` con `/XD "docs"` y `/XF "*.md"`, y luego el README básico |
| Cargas masivas de datos desde el Repositorio 1 | La base es compartida y es el espacio de pruebas del equipo | Solo datos mínimos |
| Abrir el Repositorio 2 en una sesión de Claude Code | Rompe el aislamiento acordado | Editor normal |
| Entregar el código resuelto | El equipo no aprende y las diferencias se descontrolan | Entregar tarjetas de Trello con la tarea |
| Cambiar nombres de campos en el Repositorio 2 | La base compartida deja de coincidir con el código | Usar los nombres de las migraciones |
| `npm install` dentro de `backend/` o `web/` | Rompe la instalación por workspaces | `npm install` en la raíz |
