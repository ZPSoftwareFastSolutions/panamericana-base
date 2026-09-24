# Correcciones 03 — Repositorio del equipo (`panamericana`)

> **Fecha:** 24/09/2026 · **Para:** Ángel · **Documento interno:** no se copia al repositorio del equipo.
> **Estado:** ⏳ Pendiente de aplicar.

---

## Qué cambió

Un comentario de `backend/eslint.config.mjs` (en el repositorio del equipo desde la copia inicial) nombraba una regla con su **código interno** de la planificación. El equipo no conoce esos códigos: se reemplaza por su explicación.

| Archivo | Antes | Ahora |
|---|---|---|
| `backend/eslint.config.mjs` (línea 11) | `// los campos de datos usan snake_case igual que en la base de datos (regla R…)` | `// los campos de datos usan snake_case: se llaman igual que en la base de datos` |

No cambia ningún comportamiento: es solo el texto de un comentario.

---

## 1. Cómo aplicarla

La forma más simple es editar la línea a mano en la rama `dev/angel` y abrir un PR chico `chore: comentario de eslint`. También se puede copiar el archivo:

```powershell
Copy-Item -LiteralPath "F:\Universidad\6to\Proyecto III\project_bus\backend\eslint.config.mjs" -Destination "F:\Universidad\6to\Proyecto III\panamericana\backend\eslint.config.mjs" -Force
```

> Si el repositorio del equipo ya tiene reglas propias en ese archivo, **editar a mano** en lugar de copiar.

---

## 2. Verificación

```bash
grep -rnE "\bR[1-7]\b" backend/*.mjs backend/src shared/src web/src
```

No debe imprimir nada (en el código solo aparecen `r1`, `r2` en minúsculas como nombres de prueba o de la métrica R², que no cuentan). Después, `npm run lint` sin errores.

---

## 3. Estado

| Paso | Estado |
|---|---|
| Corrección hecha en `panamericana-base` (rama `sprint04`) | ✅ 24/09 |
| Aplicada en el repositorio del equipo | ⏳ |
