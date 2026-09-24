import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { AsientoDelBus, BusDelCroquis, DatosAsiento } from '../dominio/Croquis';
import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import { AsientoDuplicadoError } from '../dominio/errores';

/** SQL del modulo croquis (tabla asientos y catalogo tipos_asiento) */
export class PgCroquisRepositorio implements CroquisRepositorio {
  constructor(private readonly db: Pool) {}

  async buscarBus(id: string): Promise<BusDelCroquis | null> {
    const resultado = await this.db.query<BusDelCroquis>(
      'select id, placa, numero_pisos from buses where id = $1',
      [id],
    );
    return resultado.rows[0] ?? null;
  }

  async listarAsientos(bus_id: string): Promise<AsientoDelBus[]> {
    const resultado = await this.db.query<AsientoDelBus>(
      `select id, numero, piso, fila, columna, tipo
         from asientos
        where bus_id = $1
        order by numero`,
      [bus_id],
    );
    return resultado.rows;
  }

  async tiposDeAsiento(): Promise<string[]> {
    const resultado = await this.db.query<{ codigo: string }>(
      'select codigo from tipos_asiento where activo order by orden',
    );
    return resultado.rows.map((fila) => fila.codigo);
  }

  async guardarAsientos(bus_id: string, asientos: DatosAsiento[]): Promise<void> {
    try {
      await enTransaccion(this.db, async (conexion) => {
        for (const a of asientos) {
          await conexion.query(
            `insert into asientos (bus_id, numero, piso, fila, columna, tipo)
             values ($1, $2, $3, $4, $5, $6)`,
            [bus_id, a.numero, a.piso, a.fila, a.columna, a.tipo],
          );
        }
      });
    } catch (error) {
      // la base protege numero y posicion unicos por bus aunque dos personas guarden a la vez
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) throw new AsientoDuplicadoError();
      throw error;
    }
  }
}
