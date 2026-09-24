import type { Pool, PoolClient } from 'pg';

/**
 * Libera las reservas vencidas de un viaje (decision del MVP: se hace al consultar
 * o al reservar, sin una tarea programada).
 *
 *  1. Los pasajes "reservado" cuyo plazo ya paso pasan a "expirado": el asiento queda libre
 *     y la restriccion contra la doble venta deja de contarlos.
 *  2. Las ventas "pendiente" que se quedaron sin pasajes reservados pasan a "expirada".
 *
 * Lo usan la disponibilidad (modulo viajes) y la reserva (modulo ventas).
 */
export async function liberarReservasVencidas(db: Pool | PoolClient, viaje_id: string): Promise<void> {
  await db.query(
    `update pasajes
        set estado = 'expirado', reservado_hasta = null
      where viaje_id = $1
        and estado = 'reservado'
        and reservado_hasta <= now()`,
    [viaje_id],
  );
  await db.query(
    `update ventas v
        set estado = 'expirada'
      where v.estado = 'pendiente'
        and exists (select 1 from pasajes p where p.venta_id = v.id and p.viaje_id = $1)
        and not exists (select 1 from pasajes p where p.venta_id = v.id and p.estado = 'reservado')`,
    [viaje_id],
  );
}

/**
 * Condicion SQL de un pasaje que OCUPA su asiento: pagado, o reservado y todavia vigente.
 * Se usa con el alias "p" para la tabla pasajes.
 */
export const PASAJE_ACTIVO = `(p.estado = 'pagado' or (p.estado = 'reservado' and p.reservado_hasta > now()))`;
