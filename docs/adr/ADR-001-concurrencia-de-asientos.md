# ADR-001 — Cómo evitamos vender el mismo asiento dos veces

- **Fecha:** 2026-09-11
- **Estado:** Aceptada
- **Responsable:** John Zabaleta

## Contexto

Un asiento de un viaje puede ser elegido al mismo tiempo desde la web, la app y la taquilla. Si dos compras se confirman a la vez, se vendería el mismo asiento dos veces. Es el riesgo más grave del sistema.

## Decisión

Tres defensas en capas distintas:

| # | Defensa | Capa | Qué hace |
|---|---|---|---|
| 1 | Retención temporal | Caso de uso | Al iniciar el pago, el pasaje se crea en estado `reservado` con `reservado_hasta`. Si vence, pasa a `expirado` y el asiento se libera. |
| 2 | Bloqueo en transacción | Adaptador de persistencia | Al confirmar, la transacción bloquea el registro con `select ... for update`, de modo que las confirmaciones se atienden una por una. |
| 3 | Restricción `unique` | Base de datos | La base de datos rechaza un segundo pasaje activo (`reservado` o `pagado`) para el mismo `viaje_id` y `asiento_id`. |

El conflicto se convierte en el error de dominio `AsientoNoDisponibleError` y en una respuesta **HTTP 409** con código `asiento_no_disponible`.

## Consecuencias

- El frontend debe manejar el 409: avisar y refrescar el croquis de asientos.
- Hace falta liberar las reservas vencidas (tarea periódica o al consultar la disponibilidad).
- Las pruebas deben incluir un caso de dos compras simultáneas del mismo asiento.
- El tiempo de retención es configurable (`MINUTOS_RESERVA_ASIENTO`, propuesta: 10 minutos; a confirmar con el equipo, pregunta P6 de `PROPUESTA_BD.md`).
