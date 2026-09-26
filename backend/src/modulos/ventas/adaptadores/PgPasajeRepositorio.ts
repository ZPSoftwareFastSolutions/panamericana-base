import type { Pool } from 'pg';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { PasajeDetalle, PasajeRepositorio } from '../dominio/PasajeRepositorio';

// una parada del tramo con su hora estimada de paso
const punto = (alias: string, terminal: string, ciudad: string) =>
  `json_build_object('orden', ${alias}.orden, 'terminal', ${terminal}.nombre, 'ciudad', ${ciudad}.nombre,
                     'hora', v.fecha_salida + make_interval(mins => ${alias}.minutos_desde_origen))`;

/** SQL de los pasajes sueltos: boleto y anulacion */
export class PgPasajeRepositorio implements PasajeRepositorio {
  constructor(private readonly db: Pool) {}

  async buscarPorCodigo(codigo: string): Promise<PasajeDetalle | null> {
    const resultado = await this.db.query<PasajeDetalle>(
      `select p.codigo, p.estado, p.precio::float8 as precio,
              json_build_object('codigo', ve.codigo, 'canal', ve.canal) as venta,
              json_build_object('numero', a.numero, 'piso', a.piso, 'tipo', a.tipo) as asiento,
              json_build_object('codigo', tp.codigo, 'nombre', tp.nombre, 'requisito', tp.requisito) as tipo_pasajero,
              json_build_object('tipo_documento', pe.tipo_documento, 'numero_documento', pe.numero_documento,
                                'nombres', pe.nombres, 'apellidos', pe.apellidos) as pasajero,
              json_build_object(
                'id', v.id, 'fecha_salida', v.fecha_salida,
                'ruta', json_build_object('id', r.id, 'nombre', r.nombre),
                'bus', json_build_object('id', b.id, 'placa', b.placa),
                'origen', ${punto('po', 'tor', 'cor')},
                'destino', ${punto('pd', 'tde', 'cde')}) as viaje
         from pasajes p
         join ventas ve on ve.id = p.venta_id
         join asientos a on a.id = p.asiento_id
         join tipos_pasajero tp on tp.codigo = p.tipo_pasajero
         join clientes cl on cl.id = p.cliente_id
         join personas pe on pe.id = cl.persona_id
         join viajes v on v.id = p.viaje_id
         join rutas r on r.id = v.ruta_id
         join buses b on b.id = v.bus_id
         join rutas_paradas po on po.ruta_id = p.ruta_id and po.orden = p.orden_origen
         join terminales tor on tor.id = po.terminal_id
         join ciudades cor on cor.id = tor.ciudad_id
         join rutas_paradas pd on pd.ruta_id = p.ruta_id and pd.orden = p.orden_destino
         join terminales tde on tde.id = pd.terminal_id
         join ciudades cde on cde.id = tde.ciudad_id
        where p.codigo = $1`,
      [codigo],
    );
    return resultado.rows[0] ?? null;
  }

  async anular(codigo: string, referencia: string): Promise<boolean> {
    return enTransaccion(this.db, async (conexion) => {
      // se bloquea la VENTA y despues el pasaje, en el mismo orden que el pago: dos anulaciones
      // de la misma venta se atienden de a una y la ultima ve que ya no queda nada activo
      const deLaVenta = await conexion.query<{ venta_id: string }>('select venta_id from pasajes where codigo = $1', [
        codigo,
      ]);
      if (!deLaVenta.rows[0]) return false;
      await conexion.query('select id from ventas where id = $1 for update', [deLaVenta.rows[0].venta_id]);
      const pasaje = await conexion.query<{ id: string; venta_id: string; precio: string }>(
        'select id, venta_id, precio from pasajes where codigo = $1 for update',
        [codigo],
      );
      const fila = pasaje.rows[0];
      if (!fila) return false;

      // solo un pasaje pagado pasa a anulado; al dejar de estar activo, el asiento queda libre
      const anulado = await conexion.query(
        `update pasajes set estado = 'anulado', reservado_hasta = null where id = $1 and estado = 'pagado'`,
        [fila.id],
      );
      if (anulado.rowCount !== 1) return false;

      // el reembolso se registra con el mismo metodo con que se cobro
      const cobro = await conexion.query<{ metodo: string }>(
        `select metodo from pagos where venta_id = $1 and estado = 'aprobado' order by creado_en limit 1`,
        [fila.venta_id],
      );
      await conexion.query(
        `insert into pagos (venta_id, monto, metodo, estado, referencia_externa)
         values ($1, $2, $3, 'reembolsado', $4)`,
        [fila.venta_id, fila.precio, cobro.rows[0]?.metodo ?? 'efectivo', referencia],
      );

      // la venta queda anulada cuando ya no le queda ningun pasaje activo ni encomiendas
      await conexion.query(
        `update ventas set estado = 'anulada'
          where id = $1
            and not exists (select 1 from pasajes where venta_id = $1 and estado in ('reservado', 'pagado'))
            and not exists (select 1 from encomiendas where venta_id = $1)`,
        [fila.venta_id],
      );
      return true;
    });
  }
}
