# Correcciones 02 — Repositorio del equipo (`panamericana`)

> **Fecha:** 22/09/2026 · **Para:** Ángel · **Documento interno:** no se copia al repositorio del equipo.
> **Estado:** ✅ **Aplicada por Ángel** (confirmado el 23/09).

---

## Qué cambió

La base de datos pasó a un **modelo normalizado (v2.0)**. Los cambios ya están **aplicados en la base compartida**: aquí solo se copian los archivos para que el repositorio del equipo coincida con la base.

| Cambio | Antes | Ahora |
|---|---|---|
| Datos personales | Repetidos en `usuarios`, `clientes` y `choferes` | Una sola tabla **`personas`**; las otras tres la enlazan con `persona_id` |
| Roles de usuario | Columna `usuarios.rol` | Tabla **`usuarios_roles`** + catálogo `roles` (un usuario puede tener varios) |
| Listas de valores | Repetidas en cada `check` | **8 catálogos**: `tipos_documento`, `tipos_asiento`, `categorias_licencia`, `metodos_pago`, `canales_venta`, `roles`, `departamentos`, `ciudades` |
| Datos calculados | `rutas.duracion_estimada_min`, `rutas.distancia_km`, `viajes.fecha_llegada_estimada`, `viajes.precio_base`, `ventas.total`, `encomiendas.estado`, `encomiendas.fecha_entrega` | **4 vistas**: `rutas_resumen`, `viajes_horarios`, `ventas_totales`, `encomiendas_estado_actual` |
| Ciudad de una terminal | `terminales.ciudad` (texto) | `terminales.ciudad_id` → `ciudades` → `departamentos` |
| Tramo de un pasaje | `parada_origen_id` + `orden_origen` (el mismo dato dos veces) | `ruta_id` + `orden_origen` / `orden_destino`, con **claves foráneas compuestas** que la base verifica |
| Tablas puente | `id` uuid decorativo | Clave natural: `rutas_paradas (ruta_id, orden)`, `viajes_choferes (viaje_id, chofer_id)`, `tarifas (viaje_id, tipo_asiento)` |

**Total:** 26 tablas y 4 vistas (antes 16 tablas).

> **El JSON de la API no cambia**: los catálogos guardan el código legible, así que un tipo de documento sigue siendo `"ci"` y un tipo de asiento `"cama"`.

---

## 1. Archivos a copiar

| Archivo | Qué es |
|---|---|
| `supabase/migrations/20260922143655_catalogos.sql` | **Nuevo:** los 8 catálogos con sus valores |
| `supabase/migrations/20260922143733_personas.sql` | **Nuevo:** `personas` y `usuarios_roles` |
| `supabase/migrations/20260922143814_derivados_y_vistas.sql` | **Nuevo:** quita las columnas calculadas y crea las vistas |
| `supabase/migrations/20260922143903_integridad_y_claves.sql` | **Nuevo:** claves naturales, catálogos como FK e integridad del tramo |
| `supabase/seed.sql` | Datos de prueba del modelo nuevo (se puede ejecutar varias veces sin duplicar) |
| `backend/src/infraestructura/verificarConexion.ts` | Ahora separa tablas y vistas en la salida |

> ⚠️ **No ejecutar nada en Supabase.** Las 4 migraciones ya están aplicadas en la base que comparten los dos repositorios.

### 1.1 Copiar (PowerShell)

```powershell
$origen = "F:\Universidad\6to\Proyecto III\project_bus"
$destino = "F:\Universidad\6to\Proyecto III\panamericana"
$archivos = @(
  "supabase\migrations\20260922143655_catalogos.sql",
  "supabase\migrations\20260922143733_personas.sql",
  "supabase\migrations\20260922143814_derivados_y_vistas.sql",
  "supabase\migrations\20260922143903_integridad_y_claves.sql",
  "supabase\seed.sql",
  "backend\src\infraestructura\verificarConexion.ts"
)
foreach ($a in $archivos) { Copy-Item (Join-Path $origen $a) (Join-Path $destino $a) -Force }
```

---

## 2. Verificar

```bash
npm run db:verificar
```

Debe decir `Conexion correcta` y listar **26 tablas** y **4 vistas**, más 2 buses.

```bash
npm test
```

Deben pasar **4 pruebas** (el módulo `buses` no cambió).

```bash
npm run build
```

```bash
git status --short
```

Solo deben aparecer los **6 archivos** de la tabla.

```bash
git add . && git grep --cached -nEi "ADR-|PROPUESTA_BD|ARQUITECTURA_CLEAN|PLANIFICACION|REPLICACION|CORRECCIONES|claude"
```

Este último comando **no debe devolver nada**.

---

## 3. Confirmar y subir

```bash
git commit -m "feat(bd): modelo normalizado con personas, catalogos y vistas"
```

```bash
git push
```

Si `main` ya está protegida, va por rama y PR:

```bash
git checkout -b dev/angel
```

---

## 4. Mensaje para el equipo (se puede copiar tal cual)

> **Actualización de la base de datos — 22/09**
>
> Antes de empezar las tareas de este sprint, hagan `git pull` de `main`. La base cambió para quedar bien normalizada:
>
> 1. **Los datos de una persona (nombres, apellidos, documento, teléfono) están en la tabla `personas`.** `usuarios`, `clientes` y `choferes` ya no los repiten: cada uno guarda `persona_id`. Para mostrar el nombre de un cliente hay que hacer `join` con `personas`.
> 2. **Los roles de un usuario están en `usuarios_roles`** (un usuario puede tener más de uno) y salen del catálogo `roles`.
> 3. **Las listas de valores ahora son tablas** (`tipos_documento`, `tipos_asiento`, `metodos_pago`, `canales_venta`, `categorias_licencia`, `departamentos`, `ciudades`). Guardan el código de siempre: `'ci'`, `'cama'`, `'taquilla'`. **El JSON de la API no cambia.**
> 4. **Lo que se puede calcular ya no se guarda**: el total de una venta, la duración de una ruta, la hora de llegada de un viaje y el estado de una encomienda se leen de las vistas `ventas_totales`, `rutas_resumen`, `viajes_horarios` y `encomiendas_estado_actual`.
> 5. **Un pasaje guarda el tramo como `ruta_id` + `orden_origen` + `orden_destino`.** Ya no existen `parada_origen_id` ni `parada_destino_id`. La base rechaza sola un pasaje con una parada de otra ruta o un asiento de otro bus.
> 6. `npm run db:verificar` debe listar **26 tablas y 4 vistas**.
>
> Regla nueva y corta: **si un dato se puede calcular a partir de otros, no se guarda en una columna**.

---

## 5. Estado

| Paso | Estado |
|---|---|
| Copiar los 6 archivos | ✅ |
| Verificar (`db:verificar`, `test`, `build`, sin rastros) | ✅ |
| Commit y push | ✅ |
| Avisar al equipo | ✅ |
