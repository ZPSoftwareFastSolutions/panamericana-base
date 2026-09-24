import type { Pool } from 'pg';
import type { Filtro, OcupacionDeViaje, PanelRepositorio } from '../dominio/PanelRepositorio';

// el dia de un registro es el de La Paz
const dia = (columna: string) => `(${columna} at time zone 'America/La_Paz')::date`;
const EN_PERIODO = (columna: string) => `${dia(columna)} between $1::date and $2::date`;
// $3 es la ruta elegida (null = todas)
const DE_LA_RUTA_VENTA = `($3::uuid is null or exists (select 1 from pasajes rp where rp.venta_id = ve.id and rp.ruta_id = $3))`;

const parametros = (filtro: Filtro) => [filtro.desde, filtro.hasta, filtro.ruta_id];

/** SQL del panel: solo lectura, siempre con parametros */
export class PgPanelRepositorio implements PanelRepositorio {
  constructor(private readonly db: Pool) {}

  async pasajes(filtro: Filtro) {
    const resultado = await this.db.query<{ vendidos: number; anulados: number }>(
      `select count(*) filter (where p.estado = 'pagado')::int as vendidos,
              count(*) filter (where p.estado = 'anulado')::int as anulados
         from pasajes p
         join ventas ve on ve.id = p.venta_id
        where ${EN_PERIODO('ve.creado_en')}
          and ($3::uuid is null or p.ruta_id = $3)`,
      parametros(filtro),
    );
    return resultado.rows[0]!;
  }

  async dinero(filtro: Filtro) {
    const resultado = await this.db.query<{ cobrado: number; reembolsado: number }>(
      `select coalesce(sum(pg.monto) filter (where pg.estado = 'aprobado'), 0)::float8 as cobrado,
              coalesce(sum(pg.monto) filter (where pg.estado = 'reembolsado'), 0)::float8 as reembolsado
         from pagos pg
         join ventas ve on ve.id = pg.venta_id
        where ${EN_PERIODO('pg.creado_en')}
          and ${DE_LA_RUTA_VENTA}`,
      parametros(filtro),
    );
    return resultado.rows[0]!;
  }

  async ventasPorCanal(filtro: Filtro) {
    // monto cobrado por canal (una venta anulada cuenta lo que se cobro; el reembolso va en "dinero")
    const resultado = await this.db.query<{ canal: string; ventas: number; monto: number }>(
      `select ve.canal, count(*)::int as ventas,
              coalesce(sum((select sum(pg.monto) from pagos pg where pg.venta_id = ve.id and pg.estado = 'aprobado')), 0)::float8 as monto
         from ventas ve
        where ve.estado in ('pagada', 'anulada')
          and ${EN_PERIODO('ve.creado_en')}
          and ${DE_LA_RUTA_VENTA}
        group by ve.canal
        order by ve.canal`,
      parametros(filtro),
    );
    return resultado.rows;
  }

  async ocupacion(filtro: Filtro): Promise<OcupacionDeViaje[]> {
    const resultado = await this.db.query<Omit<OcupacionDeViaje, 'fecha_salida'> & { fecha_salida: Date }>(
      `select v.id as viaje_id, v.fecha_salida, r.nombre as ruta, b.placa as bus,
              (select count(distinct p.asiento_id) from pasajes p
                where p.viaje_id = v.id and p.estado = 'pagado')::int as vendidos,
              (select count(*) from asientos a where a.bus_id = v.bus_id)::int as total
         from viajes v
         join rutas r on r.id = v.ruta_id
         join buses b on b.id = v.bus_id
        where v.estado <> 'cancelado'
          and ${EN_PERIODO('v.fecha_salida')}
          and ($3::uuid is null or v.ruta_id = $3)
        order by v.fecha_salida
        limit 200`,
      parametros(filtro),
    );
    return resultado.rows.map((fila) => ({ ...fila, fecha_salida: fila.fecha_salida.toISOString() }));
  }

  async encomiendas(filtro: Filtro) {
    const resultado = await this.db.query<{ estado: string; cantidad: number; ingresos: number }>(
      `select ea.estado, count(*)::int as cantidad, coalesce(sum(e.costo), 0)::float8 as ingresos
         from encomiendas e
         join encomiendas_estado_actual ea on ea.encomienda_id = e.id
        where ${EN_PERIODO('e.creado_en')}
        group by ea.estado`,
      [filtro.desde, filtro.hasta],
    );
    return resultado.rows;
  }
}
