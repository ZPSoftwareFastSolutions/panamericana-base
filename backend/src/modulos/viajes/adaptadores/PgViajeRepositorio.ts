import type { Pool } from 'pg';
import { PASAJE_ACTIVO, liberarReservasVencidas } from '../../../compartido/adaptadores/pg/reservasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { ParadaDelViaje } from '../../../compartido/dominio/Tramo';
import type { BusParaProgramar, NuevoViaje, RutaParaProgramar, TarifaEntrada } from '../dominio/Programacion';
import type {
  AsientoDelTramo,
  CandidatoBusqueda,
  ViajeConParadas,
  ViajeRepositorio,
  ViajeResumen,
} from '../dominio/ViajeRepositorio';
import { BusOcupadoError } from '../dominio/errores';

/** zona horaria de Bolivia: las fechas que elige el usuario son dias de La Paz */
const ZONA = 'America/La_Paz';

type FilaViaje = Omit<ViajeResumen, 'fecha_salida' | 'fecha_llegada_estimada'> & {
  fecha_salida: Date;
  fecha_llegada_estimada: Date;
};

// la llegada no se guarda: salida + duracion de la ruta (vista rutas_resumen)
const CONSULTA_VIAJES = `
  select v.id, v.fecha_salida, v.estado,
         v.fecha_salida + make_interval(mins => rr.duracion_estimada_min) as fecha_llegada_estimada,
         json_build_object('id', r.id, 'nombre', r.nombre) as ruta,
         json_build_object('id', b.id, 'placa', b.placa) as bus,
         coalesce((select json_agg(json_build_object('tipo_asiento', t.tipo_asiento, 'precio', t.precio) order by ta.orden)
                     from tarifas t join tipos_asiento ta on ta.codigo = t.tipo_asiento
                    where t.viaje_id = v.id), '[]') as tarifas,
         (select count(*) from asientos a where a.bus_id = v.bus_id)::int as total_asientos,
         (select count(distinct p.asiento_id) from pasajes p
           where p.viaje_id = v.id and ${PASAJE_ACTIVO})::int as asientos_vendidos
    from viajes v
    join rutas r on r.id = v.ruta_id
    join rutas_resumen rr on rr.ruta_id = r.id
    join buses b on b.id = v.bus_id`;

// una parada como objeto para el dominio (compartido/dominio/Tramo.ts)
const parada = (alias: string, terminal: string, ciudad: string) =>
  `json_build_object('orden', ${alias}.orden, 'minutos_desde_origen', ${alias}.minutos_desde_origen,
                     'terminal', ${terminal}.nombre, 'ciudad', ${ciudad}.nombre)`;

// otro viaje del mismo bus ($1) cuyo horario se cruza con [salida $2, llegada $3)
const CHOQUE_DE_HORARIO = `
  select 1
    from viajes v join rutas_resumen rr on rr.ruta_id = v.ruta_id
   where v.bus_id = $1
     and v.estado in ('programado', 'en_ruta')
     and v.fecha_salida < $3
     and $2 < v.fecha_salida + make_interval(mins => rr.duracion_estimada_min)
   limit 1`;

function aResumen(fila: FilaViaje): ViajeResumen {
  return {
    ...fila,
    fecha_salida: fila.fecha_salida.toISOString(),
    fecha_llegada_estimada: fila.fecha_llegada_estimada.toISOString(),
  };
}

/** Aqui, y solo aqui, se escribe SQL del modulo viajes. */
export class PgViajeRepositorio implements ViajeRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(desde: string): Promise<ViajeResumen[]> {
    const resultado = await this.db.query<FilaViaje>(
      `${CONSULTA_VIAJES}
        where (v.fecha_salida at time zone '${ZONA}')::date >= $1::date
        order by v.fecha_salida
        limit 200`,
      [desde],
    );
    return resultado.rows.map(aResumen);
  }

  async buscarPorId(id: string): Promise<ViajeResumen | null> {
    const resultado = await this.db.query<FilaViaje>(`${CONSULTA_VIAJES} where v.id = $1`, [id]);
    return resultado.rows[0] ? aResumen(resultado.rows[0]) : null;
  }

  async datosParaProgramar(ruta_id: string, bus_id: string) {
    const ruta = await this.db.query<RutaParaProgramar>(
      `select r.id, r.nombre, r.activo, rr.duracion_estimada_min as duracion_min
         from rutas r join rutas_resumen rr on rr.ruta_id = r.id
        where r.id = $1`,
      [ruta_id],
    );
    const bus = await this.db.query<BusParaProgramar>(
      `select b.id, b.placa, b.estado,
              array(select distinct a.tipo from asientos a where a.bus_id = b.id) as tipos_asiento
         from buses b
        where b.id = $1`,
      [bus_id],
    );
    return { ruta: ruta.rows[0] ?? null, bus: bus.rows[0] ?? null };
  }

  async busOcupado(bus_id: string, salida: Date, llegada: Date): Promise<boolean> {
    const resultado = await this.db.query(CHOQUE_DE_HORARIO, [bus_id, salida, llegada]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async guardar(viaje: NuevoViaje): Promise<void> {
    await enTransaccion(this.db, async (conexion) => {
      // se bloquea el bus: si dos personas programan el mismo bus a la vez, se atienden de a una
      const bus = await conexion.query<{ placa: string }>('select placa from buses where id = $1 for update', [
        viaje.bus_id,
      ]);
      // se vuelve a revisar con el bus bloqueado
      const choque = await conexion.query(CHOQUE_DE_HORARIO, [
        viaje.bus_id,
        viaje.fecha_salida,
        viaje.fecha_llegada_estimada,
      ]);
      if ((choque.rowCount ?? 0) > 0) throw new BusOcupadoError(bus.rows[0]?.placa ?? '');

      await conexion.query('insert into viajes (id, ruta_id, bus_id, fecha_salida) values ($1, $2, $3, $4)', [
        viaje.id,
        viaje.ruta_id,
        viaje.bus_id,
        viaje.fecha_salida,
      ]);
      for (const tarifa of viaje.tarifas) {
        await conexion.query('insert into tarifas (viaje_id, tipo_asiento, precio) values ($1, $2, $3)', [
          viaje.id,
          tarifa.tipo_asiento,
          tarifa.precio,
        ]);
      }
    });
  }

  async datosParaEditarTarifas(viaje_id: string) {
    const resultado = await this.db.query<{ estado: string; fecha_salida: Date; placa: string; tipos_asiento: string[] }>(
      `select v.estado, v.fecha_salida, b.placa,
              array(select distinct a.tipo from asientos a where a.bus_id = b.id) as tipos_asiento
         from viajes v join buses b on b.id = v.bus_id
        where v.id = $1`,
      [viaje_id],
    );
    return resultado.rows[0] ?? null;
  }

  async reemplazarTarifas(viaje_id: string, tarifas: TarifaEntrada[]): Promise<void> {
    await enTransaccion(this.db, async (conexion) => {
      // el viaje se bloquea para que dos cambios de precio no se mezclen
      await conexion.query('select id from viajes where id = $1 for update', [viaje_id]);
      await conexion.query('delete from tarifas where viaje_id = $1', [viaje_id]);
      for (const tarifa of tarifas) {
        await conexion.query('insert into tarifas (viaje_id, tipo_asiento, precio) values ($1, $2, $3)', [
          viaje_id,
          tarifa.tipo_asiento,
          tarifa.precio,
        ]);
      }
    });
  }

  async buscarCandidatos(origen: string, destino: string, fecha: string): Promise<CandidatoBusqueda[]> {
    // po = parada donde sube (en la ciudad de origen) · pd = parada donde baja (posterior, en la de destino)
    const resultado = await this.db.query<CandidatoBusqueda>(
      `select v.id as viaje_id, v.fecha_salida,
              json_build_object('id', r.id, 'nombre', r.nombre) as ruta,
              json_build_object('id', b.id, 'placa', b.placa) as bus,
              rr.duracion_estimada_min as duracion_ruta,
              ${parada('po', 'tor', 'cor')} as origen,
              ${parada('pd', 'tde', 'cde')} as destino,
              coalesce((select json_agg(json_build_object('tipo_asiento', t.tipo_asiento, 'precio', t.precio))
                          from tarifas t
                         where t.viaje_id = v.id
                           and exists (select 1 from asientos a where a.bus_id = v.bus_id and a.tipo = t.tipo_asiento)),
                       '[]') as tarifas,
              ((select count(*) from asientos a where a.bus_id = v.bus_id)
               - (select count(distinct p.asiento_id) from pasajes p
                   where p.viaje_id = v.id and ${PASAJE_ACTIVO}
                     and int4range(p.orden_origen, p.orden_destino) && int4range(po.orden, pd.orden)))::int
                as asientos_libres
         from viajes v
         join rutas r on r.id = v.ruta_id and r.activo
         join rutas_resumen rr on rr.ruta_id = v.ruta_id
         join buses b on b.id = v.bus_id
         join rutas_paradas po on po.ruta_id = v.ruta_id
         join terminales tor on tor.id = po.terminal_id
         join ciudades cor on cor.id = tor.ciudad_id
         join rutas_paradas pd on pd.ruta_id = v.ruta_id and pd.orden > po.orden
         join terminales tde on tde.id = pd.terminal_id
         join ciudades cde on cde.id = tde.ciudad_id
        where v.estado = 'programado'
          and cor.id = $1 and cde.id = $2
          and v.fecha_salida + make_interval(mins => po.minutos_desde_origen) > now()
          and ((v.fecha_salida + make_interval(mins => po.minutos_desde_origen)) at time zone '${ZONA}')::date = $3::date`,
      [origen, destino, fecha],
    );
    return resultado.rows;
  }

  async buscarConParadas(viaje_id: string): Promise<ViajeConParadas | null> {
    const resultado = await this.db.query<ViajeConParadas & { paradas: ParadaDelViaje[]; tarifas: TarifaEntrada[] }>(
      `select v.id, v.estado, v.fecha_salida, b.numero_pisos,
              rr.duracion_estimada_min as duracion_ruta,
              (select json_agg(${parada('rp', 't', 'c')} order by rp.orden)
                 from rutas_paradas rp
                 join terminales t on t.id = rp.terminal_id
                 join ciudades c on c.id = t.ciudad_id
                where rp.ruta_id = v.ruta_id) as paradas,
              coalesce((select json_agg(json_build_object('tipo_asiento', t.tipo_asiento, 'precio', t.precio))
                          from tarifas t where t.viaje_id = v.id), '[]') as tarifas
         from viajes v
         join buses b on b.id = v.bus_id
         join rutas_resumen rr on rr.ruta_id = v.ruta_id
        where v.id = $1`,
      [viaje_id],
    );
    return resultado.rows[0] ?? null;
  }

  async liberarReservasVencidas(viaje_id: string): Promise<void> {
    await liberarReservasVencidas(this.db, viaje_id);
  }

  async asientosDelTramo(viaje_id: string, desde: number, hasta: number): Promise<AsientoDelTramo[]> {
    // un asiento esta ocupado si algun pasaje activo lo usa en un tramo que se cruza con [desde, hasta)
    const resultado = await this.db.query<AsientoDelTramo>(
      `select a.id, a.numero, a.piso, a.fila, a.columna, a.tipo,
              exists (select 1 from pasajes p
                       where p.viaje_id = v.id and p.asiento_id = a.id and ${PASAJE_ACTIVO}
                         and int4range(p.orden_origen, p.orden_destino) && int4range($2::int, $3::int)) as ocupado
         from viajes v
         join asientos a on a.bus_id = v.bus_id
        where v.id = $1
        order by a.numero`,
      [viaje_id, desde, hasta],
    );
    return resultado.rows;
  }
}
