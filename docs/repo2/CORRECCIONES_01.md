# Correcciones 01 — Repositorio del equipo (`panamericana`)

> **Fecha:** 15/09/2026 · **Para:** Ángel · **Documento interno:** no se copia al repositorio del equipo.
> Hacerlo **en este orden** y, si es posible, **antes de invitar colaboradores y de crear las ramas `dev/*`**. Si ya se hizo alguna de las dos cosas, ver el paso 1.7.

---

## Parte 1 — Sacar la cuenta Z&P del repositorio del equipo

**Qué pasó:** en la computadora donde se montó el repositorio, la identidad global de git es `ZPSoftwareFastSolutions <zapasoftwarefastsolutions@gmail.com>` y probablemente también están guardadas sus credenciales de GitHub. Por eso el primer commit (`abc3300`) quedó con la autoría de Z&P. El repositorio lo debe administrar **AngelParedesH20**.

### 1.1 Diagnóstico

En Git Bash, dentro de `F:\Universidad\6to\Proyecto III\panamericana`:

```bash
git log --format="%h | autor: %an <%ae> | confirmó: %cn <%ce>"
```

Si aparece `ZPSoftwareFastSolutions`, sigue con los pasos.

### 1.2 Identidad de Ángel solo para este repositorio

```bash
git config user.name "Ángel Fabricio Paredes Campos"
```

```bash
git config user.email "TU_CORREO"
```

`TU_CORREO` debe estar **vinculado a la cuenta AngelParedesH20** para que GitHub muestre su avatar en los commits:
- el correo verificado en GitHub → *Settings → Emails*, o
- la dirección *noreply* que aparece ahí mismo si tiene activado *Keep my email addresses private* (`NUMERO+AngelParedesH20@users.noreply.github.com`).

Comprobar que quedó como configuración **local** (debe decir `file:.git/config`):

```bash
git config --show-origin user.email
```

### 1.3 Credenciales de AngelParedesH20 en esta computadora

```bash
git remote set-url origin https://AngelParedesH20@github.com/AngelParedesH20/panamericana.git
```

Con el usuario dentro de la URL, el administrador de credenciales de Git para Windows pide iniciar sesión como **AngelParedesH20** y guarda esa credencial aparte. Además desaparece el aviso *"This repository moved"*.

> ⚠️ **No borrar** la credencial de Z&P del Administrador de credenciales de Windows: la sigue usando `panamericana-base`.

### 1.4 Reescribir la autoría

Si `main` tiene **un solo commit**:

```bash
git commit --amend --reset-author --no-edit
```

Si ya tiene **varios commits**:

```bash
git rebase --root --exec "git commit --amend --reset-author --no-edit"
```

Volver a ejecutar el comando de 1.1: **autor** y **confirmó** deben ser Ángel en todos los commits.

### 1.5 Subir la historia corregida

Si `main` ya tiene regla de protección, desactivar temporalmente *"Do not allow force pushes"* (o la regla completa) en *Settings → Branches*.

```bash
git push --force-with-lease origin main
```

Cuando se abra el navegador para iniciar sesión, entrar con **AngelParedesH20**. Después, volver a activar la protección de `main`.

### 1.6 Revisar en GitHub

- [ ] La lista de commits muestra el avatar y el usuario **AngelParedesH20**.
- [ ] *Settings → Collaborators*: si aparece `ZPSoftwareFastSolutions`, pulsar **Remove**.
- [ ] *Settings → General*: el dueño es AngelParedesH20.
- [ ] *Insights → Contributors*: solo Ángel (puede tardar unos minutos en actualizarse).

### 1.7 Si ya existían ramas `dev/*` o alguien ya clonó

Borrar las ramas remotas creadas sobre el commit viejo:

```bash
git push origin --delete dev/angel dev/john dev/grisel dev/brisa dev/karime
```

Recrearlas desde el `main` corregido (paso A8 de la guía del Sprint 1). Quien ya haya clonado debe borrar su carpeta y **clonar de nuevo**.

### 1.8 Opción sin ningún rastro (solo si aún no se invitó a nadie)

GitHub puede conservar un tiempo el commit viejo accesible por su código (`abc3300…`) aunque ya no aparezca en ninguna lista. Si se quiere eliminar incluso eso:

1. GitHub → *Settings → Danger Zone → Delete this repository*.
2. Crear de nuevo `panamericana` (privado, sin README).
3. Borrar la carpeta `.git` local y ejecutar `git init -b main`.
4. Repetir 1.2 y 1.3, luego `git add .`, `git commit -m "estructura base del proyecto"` y `git push -u origin main`.

---

## Parte 2 — Copiar los ajustes para Bolivia

Cambios hechos en `panamericana-base` el 15/09:

| Archivo | Cambio |
|---|---|
| `backend/src/modulos/buses/dominio/Bus.ts` | La placa debe ser boliviana: 3 o 4 dígitos y 3 letras (`2045KLP`); se ignoran espacios y guiones |
| `backend/src/modulos/buses/casos-de-uso/RegistrarBus.test.ts` | Datos bolivianos y una prueba nueva de placa inválida (4 pruebas) |
| `backend/.env.example` | Sin `SUPABASE_JWT_SECRET` (el proyecto firma los tokens con ECC P-256 y se validarán con JWKS) |
| `web/src/modulos/buses/componentes/FormularioBus.tsx` | Ejemplo de placa en el campo |
| `supabase/migrations/20260915052138_documentos_bolivia.sql` | **Nuevo:** `tipo_documento` acepta `ci`, `ce` y `pasaporte` (antes `dni`) |
| `supabase/seed.sql` | Datos de prueba bolivianos: CI, placas, celulares y la ruta La Paz → Oruro → Cochabamba |

> La migración y los datos **ya están aplicados en la base compartida**. No hay que ejecutar nada en Supabase: el archivo de la migración se copia para que el historial del repositorio coincida con la base.

### 2.1 Copiar (PowerShell)

```powershell
$origen = "F:\Universidad\6to\Proyecto III\project_bus"
$destino = "F:\Universidad\6to\Proyecto III\panamericana"
$archivos = @(
  "backend\src\modulos\buses\dominio\Bus.ts",
  "backend\src\modulos\buses\casos-de-uso\RegistrarBus.test.ts",
  "backend\.env.example",
  "web\src\modulos\buses\componentes\FormularioBus.tsx",
  "supabase\migrations\20260915052138_documentos_bolivia.sql",
  "supabase\seed.sql"
)
foreach ($a in $archivos) { Copy-Item (Join-Path $origen $a) (Join-Path $destino $a) -Force }
```

### 2.2 Verificar

```bash
npm test
```

Deben pasar **4 pruebas**.

```bash
npm run build
```

```bash
npm run db:verificar
```

Debe listar 16 tablas y 2 buses. En http://localhost:3000/admin/buses las placas son `2045KLP` y `3187HTR`.

```bash
git status --short
```

Solo deben aparecer los 6 archivos de la tabla.

```bash
git add . && git grep --cached -nEi "ADR-|PROPUESTA_BD|ARQUITECTURA_CLEAN|PLANIFICACION|REPLICACION|CORRECCIONES|claude"
```

Este último comando **no debe devolver nada**.

### 2.3 Confirmar y subir (ya con la identidad de Ángel)

Si `main` todavía no está protegida:

```bash
git commit -m "feat: reglas y datos de prueba para Bolivia (CI y placas)"
```

```bash
git push
```

Si `main` ya está protegida: hacer el commit en `dev/angel` y abrir un Pull Request hacia `main`.

### 2.4 Aviso al equipo

Quien ya haya creado su `backend/.env` puede borrar la línea `SUPABASE_JWT_SECRET=` (dejarla no rompe nada).

---

## Parte 3 — Checklist final

- [ ] `git log` muestra solo commits de AngelParedesH20
- [ ] `ZPSoftwareFastSolutions` no aparece en colaboradores
- [ ] El remoto es `https://AngelParedesH20@github.com/AngelParedesH20/panamericana.git`
- [ ] Los 6 archivos copiados y 4 pruebas en verde
- [ ] `main` protegida de nuevo (si se desactivó en 1.5)
