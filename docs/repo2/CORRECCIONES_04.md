# Correcciones 04 — Repositorio del equipo (`panamericana`)

> **Fecha:** 26/09/2026 · **Para:** Ángel · **Documento interno:** no se copia al repositorio del equipo.
> **Estado:** ⏳ Pendiente de aplicar.

---

## Qué cambió

Dos problemas de incrementos anteriores que encontró la revisión de calidad y legal del 26/09. Se aplican **antes** de `REPLICACION_CALIDAD.md`.

| Archivo | Problema | Corrección |
|---|---|---|
| `web/src/app/favicon.ico` (en el repositorio del equipo desde la copia inicial) | Era el ícono que trae la plantilla de Next.js: el **logo de Vercel**, una marca de otra empresa. No se puede publicar como ícono de Panamericana | Se reemplazó por el ícono propio del bus (16, 32 y 48 px), generado a partir de `web/public/icono-512.png` |
| `shared/src/tipos/panel.ts` (incremento 4) | Dos comentarios citaban códigos internos de historias (`HU-…`) que el equipo no conoce | Se quitaron los códigos; el texto del comentario queda igual |

No cambia ningún comportamiento.

---

## 1. Cómo aplicarla

En la rama `dev/angel`, PR chico `chore: favicon propio y comentarios`:

```powershell
$origen = "F:\Universidad\6to\Proyecto III\project_bus"
$destino = "F:\Universidad\6to\Proyecto III\panamericana"
Copy-Item -LiteralPath "$origen\web\src\app\favicon.ico" -Destination "$destino\web\src\app\favicon.ico" -Force
```

`shared/src/tipos/panel.ts`: si el incremento 4 **todavía no** está en el repositorio del equipo, no hay que hacer nada (la versión corregida llega con él). Si ya está, borrar a mano ` (HU-029)` y ` (HU-033)` de los dos comentarios, o copiar el archivo:

```powershell
Copy-Item -LiteralPath "$origen\shared\src\tipos\panel.ts" -Destination "$destino\shared\src\tipos\panel.ts" -Force
```

---

## 2. Verificación

```bash
grep -rn "HU-[0-9]" backend/src shared/src web/src supabase
```

No debe imprimir nada. Para el ícono, abrir `http://localhost:3000/favicon.ico`: debe verse el bus blanco con franja amarilla sobre fondo azul oscuro, no un triángulo.

---

## 3. Estado

| Paso | Estado |
|---|---|
| Correcciones hechas en `panamericana-base` (rama `calidad-y-legal`) | ✅ 26/09 |
| Aplicadas en el repositorio del equipo | ⏳ |
