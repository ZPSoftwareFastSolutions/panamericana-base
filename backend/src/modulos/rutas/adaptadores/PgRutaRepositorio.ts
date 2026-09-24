import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { NuevaRuta } from '../dominio/Ruta';
import type { RutaDetalle, RutaRepositorio } from '../dominio/RutaRepositorio';
import { RutaDuplicadaError } from '../dominio/errores';

// la ruta con sus paradas en orden; duracion y distancia salen de la vista rutas_resumen
const CONSULTA_BASE = `
  select r.id, r.nombre, r.activo,
         rr.duracion_estimada_min,
         rr.distancia_km::float8 as distancia_km,
         json_agg(json_build_object(
           'orden', rp.orden,
           'minutos_desde_origen', rp.minutos_desde_origen,
           'km_desde_origen', rp.km_desde_origen,
           'terminal', json_build_object('id', t.id, 'nombre', t.nombre, 'ciudad', c.nombre)
         ) order by rp.orden) as paradas
    from rutas r
    join rutas_resumen rr on rr.ruta_id = r.id
    join rutas_paradas rp on rp.ruta_id = r.id
    join terminales t on t.id = rp.terminal_id
    join ciudades c on c.id = t.ciudad_id`;

const AGRUPAR = 'group by r.id, rr.duracion_estimada_min, rr.distancia_km';

/** Aqui, y solo aqui, se escribe SQL del modulo rutas. */
export class PgRutaRepositorio implements RutaRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(): Promise<RutaDetalle[]> {
    const resultado = await this.db.query<RutaDetalle>(`${CONSULTA_BASE} ${AGRUPAR} order by r.nombre`);
    return resultado.rows;
  }

  async buscarPorId(id: string): Promise<RutaDetalle | null> {
    const resultado = await this.db.query<RutaDetalle>(`${CONSULTA_BASE} where r.id = $1 ${AGRUPAR}`, [id]);
    return resultado.rows[0] ?? null;
  }

  async existeNombre(nombre: string): Promise<boolean> {
    const resultado = await this.db.query('select 1 from rutas where lower(nombre) = lower($1)', [nombre]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async terminalesActivas(ids: string[]): Promise<string[]> {
    const resultado = await this.db.query<{ id: string }>(
      'select id from terminales where activo and id = any($1::uuid[])',
      [ids],
    );
    return resultado.rows.map((fila) => fila.id);
  }

  async guardar(ruta: NuevaRuta): Promise<void> {
    // la ruta y sus paradas se guardan juntas: una ruta sin paradas no tiene sentido
    try {
      await enTransaccion(this.db, async (conexion) => {
        await conexion.query('insert into rutas (id, nombre) values ($1, $2)', [ruta.id, ruta.nombre]);
        for (const p of ruta.paradas) {
          await conexion.query(
            `insert into rutas_paradas (ruta_id, orden, terminal_id, minutos_desde_origen, km_desde_origen)
             values ($1, $2, $3, $4, $5)`,
            [ruta.id, p.orden, p.terminal_id, p.minutos_desde_origen, p.km_desde_origen],
          );
        }
      });
    } catch (error) {
      // el indice unico rutas_nombre_unico atrapa a dos registros simultaneos con el mismo nombre
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) throw new RutaDuplicadaError(ruta.nombre);
      throw error;
    }
  }
}
