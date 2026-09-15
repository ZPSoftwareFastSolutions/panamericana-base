# Guía del Sprint N — Panamericana

> **Sprint:** N · **Fechas:** dd/mm/2026 → dd/mm/2026
> **Para:** todo el equipo de desarrollo
> **Objetivo del sprint:** (una frase)

---

## 1. Qué se construye en este sprint

| # | Funcionalidad | Módulo | Responsable | Puntos |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |

**Criterios de aceptación del sprint:**
- [ ]
- [ ]

---

## 2. Base de datos

| Migración | Tablas / campos que crea o cambia |
|---|---|
| `20260101000000_nombre.sql` | |

Recordatorio: palabras SQL en minúsculas y nombres de campos idénticos al modelo aprobado.

**Cómo aplicar las migraciones:**

```bash
supabase db push
```

---

## 3. Endpoints del contrato

| Método | Ruta | Caso de uso | Respuestas |
|---|---|---|---|
| POST | `/v1/...` | | 201, 400, 409 |

Las rutas y los tipos se declaran en `shared/src/` (es el contrato que ve el equipo).

---

## 4. Backend — archivos por módulo

Para cada módulo, en este orden (ver `ARQUITECTURA_CLEAN.md`, sección 8):

| Paso | Archivo | Qué contiene |
|---|---|---|
| 1 | `dominio/<Entidad>.ts` | entidad y reglas |
| 2 | `dominio/errores.ts` | errores del negocio |
| 3 | `dominio/<Entidad>Repositorio.ts` | interfaz |
| 4 | `casos-de-uso/<Accion>.ts` + `.test.ts` | acción y prueba |
| 5 | `adaptadores/Pg<Entidad>Repositorio.ts` | SQL |
| 6 | `adaptadores/<entidad>Rutas.ts` | HTTP + validación |
| 7 | `contenedor.ts`, `main.ts` | conectar y registrar |

**Reglas del negocio que deben quedar en el dominio:**
-

---

## 5. Frontend — pantallas

| Pantalla | Ruta | Módulo | Responsable |
|---|---|---|---|
| | | | |

**Estados que hay que manejar:** cargando, vacío, error y conflicto (409).

---

## 6. Decisiones tomadas en el sprint

| Decisión | Motivo |
|---|---|
| | |

---

## 7. Checklist de cierre

- [ ] Todas las pruebas pasan
- [ ] El contrato refleja los endpoints reales
- [ ] Migraciones aplicadas en staging
- [ ] SQL en minúsculas y nombres sin cambios (R1–R6)
- [ ] Sin claves ni archivos `.env` en el repositorio
- [ ] Demo funcionando de punta a punta
