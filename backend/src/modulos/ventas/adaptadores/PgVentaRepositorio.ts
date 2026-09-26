import type { Pool, PoolClient } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { guardarCliente } from '../../../compartido/adaptadores/pg/personasSql';
import { PASAJE_ACTIVO, liberarReservasVencidas } from '../../../compartido/adaptadores/pg/reservasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { AsientoParaReservar, TipoDePasajero, VentaNueva, ViajeParaReservar } from '../dominio/Venta';
import type { ResultadoPago, VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import { AsientoNoDisponibleError } from '../dominio/errores';

/** los asientos elegidos que ya estan ocupados en el tramo (lista de numeros) */
async function asientosOcupados(
  db: Pool | PoolClient,
  viaje_id: string,
  asientos: string[],
  desde: number,
  hasta: number,
): Promise<number[]> {
  const resultado = await db.query<{ numero: number }>(
    `select a.numero
       from asientos a
      where a.id = any($2::uuid[])
        and exists (select 1 from pasajes p
                     where p.viaje_id = $1 and p.asiento_id = a.id and ${PASAJE_ACTIVO}
                       and int4range(p.orden_origen, p.orden_destino) && int4range($3::int, $4::int))
      order by a.numero`,
    [viaje_id, asientos, desde, hasta],
  );
  return resultado.rows.map((fila) => fila.numero);
}

/** Aqui, y solo aqui, se escribe SQL del modulo ventas. */
export class PgVentaRepositorio implements VentaRepositorio {
  constructor(private readonly db: Pool) {}

  async contextoDeReserva(viaje_id: string, desde: number, hasta: number) {
    const viaje = await this.db.query<ViajeParaReservar>(
      `select v.id, v.ruta_id, v.bus_id, v.estado, v.fecha_salida,
              rr.duracion_estimada_min as duracion_ruta,
              (select json_agg(json_build_object('orden', rp.orden, 'minutos_desde_origen', rp.minutos_desde_origen,
                                                 'terminal', t.nombre, 'ciudad', c.nombre) order by rp.orden)
                 from rutas_paradas rp
                 join terminales t on t.id = rp.terminal_id
                 join ciudades c on c.id = t.ciudad_id
                where rp.ruta_id = v.ruta_id) as paradas,
              coalesce((select json_agg(json_build_object('tipo_asiento', t.tipo_asiento, 'precio', t.precio))
                          from tarifas t where t.viaje_id = v.id), '[]') as tarifas
         from viajes v
         join rutas_resumen rr on rr.ruta_id = v.ruta_id
        where v.id = $1`,
      [viaje_id],
    );
    if (!viaje.rows[0]) return null;

    // PASAJE_ACTIVO ya ignora las reservas vencidas; se liberan despues, dentro de guardarReserva
    const asientos = await this.db.query<AsientoParaReservar>(
      `select a.id, a.numero, a.tipo,
              exists (select 1 from pasajes p
                       where p.viaje_id = $1 and p.asiento_id = a.id and ${PASAJE_ACTIVO}
                         and int4range(p.orden_origen, p.orden_destino) && int4range($2::int, $3::int)) as ocupado
         from asientos a
        where a.bus_id = $4`,
      [viaje_id, desde, hasta, viaje.rows[0].bus_id],
    );
    const tipos = await this.db.query<TipoDePasajero>(
      'select codigo, descuento_porcentaje::float8 as descuento_porcentaje from tipos_pasajero where activo',
    );
    return { viaje: viaje.rows[0], asientos: asientos.rows, tiposPasajero: tipos.rows };
  }

  async guardarReserva(venta: VentaNueva): Promise<void> {
    try {
      await enTransaccion(this.db, async (conexion) => {
        // DEFENSA 2 — turno en la base: se bloquea el viaje; otra reserva del mismo viaje espera aqui
        await conexion.query('select id from viajes where id = $1 for update', [venta.viaje_id]);
        await liberarReservasVencidas(conexion, venta.viaje_id);

        // con el turno tomado se vuelve a mirar: nadie puede haber reservado entre la consulta y ahora
        const ocupados = await asientosOcupados(
          conexion,
          venta.viaje_id,
          venta.pasajes.map((p) => p.asiento_id),
          venta.orden_origen,
          venta.orden_destino,
        );
        if (ocupados.length > 0) throw new AsientoNoDisponibleError(ocupados);

        // cada pasajero es un cliente; si ya existia por su documento, se reutiliza
        const clientes: string[] = [];
        for (const pasaje of venta.pasajes) {
          clientes.push(await guardarCliente(conexion, pasaje.pasajero));
        }

        await conexion.query(
          `insert into ventas (id, codigo, cliente_id, usuario_id, canal, estado)
           values ($1, $2, $3, $4, $5, 'pendiente')`,
          [venta.id, venta.codigo, clientes[0], venta.usuario_id, venta.canal],
        );

        for (const [i, pasaje] of venta.pasajes.entries()) {
          // DEFENSA 3 — la restriccion pasajes_asiento_sin_traslape rechaza un tramo que se cruce
          await conexion.query(
            `insert into pasajes (id, codigo, venta_id, viaje_id, asiento_id, cliente_id, ruta_id, bus_id,
                                  orden_origen, orden_destino, precio, estado, reservado_hasta, tipo_pasajero)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'reservado', $12, $13)`,
            [
              pasaje.id,
              pasaje.codigo,
              venta.id,
              venta.viaje_id,
              pasaje.asiento_id,
              clientes[i],
              venta.ruta_id,
              venta.bus_id,
              venta.orden_origen,
              venta.orden_destino,
              pasaje.precio,
              venta.reservado_hasta,
              pasaje.tipo_pasajero,
            ],
          );
        }
      });
    } catch (error) {
      if (codigoPg(error) === CODIGOS_PG.EXCLUSION) throw new AsientoNoDisponibleError();
      throw error;
    }
  }

  async buscarPorCodigo(codigo: string): Promise<VentaDetalle | null> {
    const punto = (alias: string, terminal: string, ciudad: string) =>
      `json_build_object('orden', ${alias}.orden, 'terminal', ${terminal}.nombre, 'ciudad', ${ciudad}.nombre,
                         'hora', v.fecha_salida + make_interval(mins => ${alias}.minutos_desde_origen))`;

    const resultado = await this.db.query<VentaDetalle>(
      `select ve.id, ve.codigo, ve.canal, ve.estado, vt.total::float8 as total, ve.creado_en,
              (select min(p.reservado_hasta) from pasajes p
                where p.venta_id = ve.id and p.estado = 'reservado') as reservado_hasta,
              (select json_build_object(
                        'id', v.id, 'fecha_salida', v.fecha_salida,
                        'ruta', json_build_object('id', r.id, 'nombre', r.nombre),
                        'bus', json_build_object('id', b.id, 'placa', b.placa),
                        'origen', ${punto('po', 'tor', 'cor')},
                        'destino', ${punto('pd', 'tde', 'cde')})
                 from pasajes p
                 join viajes v on v.id = p.viaje_id
                 join rutas r on r.id = v.ruta_id
                 join buses b on b.id = v.bus_id
                 join rutas_paradas po on po.ruta_id = p.ruta_id and po.orden = p.orden_origen
                 join terminales tor on tor.id = po.terminal_id
                 join ciudades cor on cor.id = tor.ciudad_id
                 join rutas_paradas pd on pd.ruta_id = p.ruta_id and pd.orden = p.orden_destino
                 join terminales tde on tde.id = pd.terminal_id
                 join ciudades cde on cde.id = tde.ciudad_id
                where p.venta_id = ve.id
                limit 1) as viaje,
              coalesce((select json_agg(json_build_object(
                          'codigo', p.codigo, 'estado', p.estado, 'precio', p.precio,
                          'asiento', json_build_object('numero', a.numero, 'piso', a.piso, 'tipo', a.tipo),
                          'tipo_pasajero', json_build_object('codigo', tp.codigo, 'nombre', tp.nombre, 'requisito', tp.requisito),
                          'pasajero', json_build_object('tipo_documento', pe.tipo_documento,
                                                        'numero_documento', pe.numero_documento,
                                                        'nombres', pe.nombres, 'apellidos', pe.apellidos))
                          order by a.numero)
                          from pasajes p
                          join asientos a on a.id = p.asiento_id
                          join tipos_pasajero tp on tp.codigo = p.tipo_pasajero
                          join clientes cl on cl.id = p.cliente_id
                          join personas pe on pe.id = cl.persona_id
                         where p.venta_id = ve.id), '[]') as pasajes
         from ventas ve
         join ventas_totales vt on vt.venta_id = ve.id
        where ve.codigo = $1`,
      [codigo],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;
    return {
      ...fila,
      reservado_hasta: fila.reservado_hasta ? new Date(fila.reservado_hasta).toISOString() : null,
      creado_en: new Date(fila.creado_en).toISOString(),
    };
  }

  async expirar(venta_id: string): Promise<void> {
    await enTransaccion(this.db, async (conexion) => {
      await conexion.query(
        `update pasajes set estado = 'expirado', reservado_hasta = null
          where venta_id = $1 and estado = 'reservado'`,
        [venta_id],
      );
      await conexion.query(`update ventas set estado = 'expirada' where id = $1 and estado = 'pendiente'`, [
        venta_id,
      ]);
    });
  }

  async registrarPago(venta_id: string, pago: { metodo: string; referencia: string }): Promise<ResultadoPago> {
    return enTransaccion(this.db, async (conexion) => {
      // la venta se bloquea: dos pagos simultaneos de la misma venta se atienden de a uno
      const venta = await conexion.query<{ estado: string }>('select estado from ventas where id = $1 for update', [
        venta_id,
      ]);
      if (venta.rows[0]?.estado !== 'pendiente') return 'no_pendiente';

      const total = await conexion.query<{ total: string }>('select total from ventas_totales where venta_id = $1', [
        venta_id,
      ]);
      const cantidad = await conexion.query<{ n: number }>('select count(*)::int as n from pasajes where venta_id = $1', [
        venta_id,
      ]);

      // solo se pagan reservas VIGENTES; si alguna vencio, no se paga nada
      const pagados = await conexion.query(
        `update pasajes set estado = 'pagado', reservado_hasta = null
          where venta_id = $1 and estado = 'reservado' and reservado_hasta > now()`,
        [venta_id],
      );
      if (pagados.rowCount !== cantidad.rows[0]!.n) {
        throw new ReservaVencidaDurantePago();
      }

      await conexion.query(
        `insert into pagos (venta_id, monto, metodo, estado, referencia_externa)
         values ($1, $2, $3, 'aprobado', $4)`,
        [venta_id, total.rows[0]!.total, pago.metodo, pago.referencia],
      );
      await conexion.query(`update ventas set estado = 'pagada' where id = $1`, [venta_id]);
      return 'pagada' as const;
    }).catch((error: unknown) => {
      // el rollback ya deshizo los pasajes a medio pagar
      if (error instanceof ReservaVencidaDurantePago) return 'expirada' as const;
      throw error;
    });
  }
}

/** senal interna: fuerza el rollback cuando una reserva vencio durante el pago */
class ReservaVencidaDurantePago extends Error {}
