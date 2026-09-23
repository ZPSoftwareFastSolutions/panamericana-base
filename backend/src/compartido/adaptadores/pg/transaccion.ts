import type { Pool, PoolClient } from 'pg';

/**
 * Ejecuta varias consultas como UNA sola operacion: o se guardan todas o ninguna.
 *
 * Uso (dentro de un repositorio):
 *   await enTransaccion(this.db, async (conexion) => {
 *     await conexion.query('insert into ...');
 *     await conexion.query('insert into ...');
 *   });
 *
 * Si algo falla dentro, se hace rollback y el error sigue su camino hasta el manejador.
 */
export async function enTransaccion<T>(
  pool: Pool,
  trabajo: (conexion: PoolClient) => Promise<T>,
): Promise<T> {
  const conexion = await pool.connect();
  try {
    await conexion.query('begin');
    const resultado = await trabajo(conexion);
    await conexion.query('commit');
    return resultado;
  } catch (error) {
    await conexion.query('rollback');
    throw error;
  } finally {
    conexion.release();
  }
}
