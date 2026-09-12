# ADR-001 — Cómo evitamos vender el mismo asiento dos veces

- **Fecha:** 2026-09-11 · **Actualizada:** 2026-09-12 (venta por tramos)
- **Estado:** Aceptada
- **Responsable:** John Zabaleta

## Contexto

Un asiento de un viaje puede elegirse al mismo tiempo desde la web, la app y la taquilla. Si dos compras se confirman a la vez, se vendería el mismo asiento dos veces.

Con la incorporación de paradas intermedias (`rutas_paradas`), el problema se vuelve más fino: el asiento 12 puede ir ocupado de la parada 1 a la 3 y estar libre de la 3 a la 5. La pregunta ya no es "¿está ocupado?", sino "¿está ocupado **en este tramo**?".

## Decisión

Tres defensas en capas distintas:

| # | Defensa | Capa | Qué hace |
|---|---|---|---|
| 1 | Retención temporal | Caso de uso | Al iniciar el pago, el pasaje se crea como `reservado` con `reservado_hasta`. Si vence, pasa a `expirado` y el asiento se libera |
| 2 | Bloqueo en transacción | Adaptador de persistencia | Al confirmar, la transacción bloquea las filas con `select ... for update`, de modo que las confirmaciones se atienden una por una |
| 3 | Restricción por tramo | Base de datos | PostgreSQL rechaza un segundo pasaje activo del mismo asiento y viaje cuyo tramo se cruce con otro ya vendido |

La tercera defensa es una restricción de exclusión sobre rangos:

```sql
create extension if not exists btree_gist;

alter table pasajes
  add constraint pasajes_asiento_sin_traslape
  exclude using gist (
    viaje_id with =,
    asiento_id with =,
    int4range(orden_origen, orden_destino) with &&
  )
  where (estado in ('reservado', 'pagado'));
```

Por eso `pasajes` guarda `orden_origen` y `orden_destino` (copiados de `rutas_paradas.orden`): la restricción se evalúa dentro de la misma fila, sin consultar otra tabla.

El conflicto se convierte en el error de dominio `AsientoNoDisponibleError` y en una respuesta **HTTP 409** con código `asiento_no_disponible`.

## Consecuencias

- El frontend debe manejar el 409: avisar y refrescar el croquis de asientos.
- La disponibilidad se consulta **por tramo**, no por viaje completo.
- Hace falta liberar las reservas vencidas (tarea periódica o al consultar disponibilidad).
- Las pruebas deben incluir dos compras simultáneas del mismo asiento con tramos que se cruzan y con tramos que no se cruzan.
- El tiempo de retención es configurable (`MINUTOS_RESERVA_ASIENTO`, propuesta: 10 minutos; pregunta P6).
