import type { Pool } from 'pg';
import type { CapacidadDelDia, PrediccionRepositorio } from '../dominio/PrediccionRepositorio';

// el dia de un viaje es el de su salida en hora de La Paz
const DIA_DE_SALIDA = `(v.fecha_salida at time zone 'America/La_Paz')::date`;

/** SQL del modulo prediccion: solo lectura */
export class PgPrediccionRepositorio implements PrediccionRepositorio {
  constructor(private readonly db: Pool) {}

  async rutasActivas(): Promise<{ id: string; nombre: string }[]> {
    const resultado = await this.db.query<{ id: string; nombre: string }>(
      'select id, nombre from rutas where activo order by nombre',
    );
    return resultado.rows;
  }

  async capacidadProgramada(desde: string, hasta: string): Promise<CapacidadDelDia[]> {
    const resultado = await this.db.query<CapacidadDelDia>(
      `select v.ruta_id, to_char(${DIA_DE_SALIDA}, 'YYYY-MM-DD') as fecha,
              sum((select count(*) from asientos a where a.bus_id = v.bus_id))::int as capacidad,
              count(*)::int as viajes
         from viajes v
        where v.estado in ('programado', 'en_ruta')
          and ${DIA_DE_SALIDA} between $1::date and $2::date
        group by v.ruta_id, ${DIA_DE_SALIDA}`,
      [desde, hasta],
    );
    return resultado.rows;
  }

  async historialDeVentas(desde: string, hasta: string) {
    const resultado = await this.db.query<{ ruta_id: string; dias_con_ventas: number; promedio: number }>(
      `select ruta_id, count(*)::int as dias_con_ventas, avg(pasajes)::float8 as promedio
         from (select p.ruta_id, ${DIA_DE_SALIDA} as dia, count(*) as pasajes
                 from pasajes p
                 join viajes v on v.id = p.viaje_id
                where p.estado = 'pagado'
                  and ${DIA_DE_SALIDA} between $1::date and $2::date
                group by p.ruta_id, ${DIA_DE_SALIDA}) as por_dia
        group by ruta_id`,
      [desde, hasta],
    );
    return resultado.rows;
  }
}
