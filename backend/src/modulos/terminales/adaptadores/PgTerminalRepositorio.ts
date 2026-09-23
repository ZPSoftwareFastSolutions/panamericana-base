import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { Terminal } from '../dominio/Terminal';
import type { CiudadDeTerminal } from '../dominio/Terminal';
import type { TerminalRepositorio } from '../dominio/TerminalRepositorio';
import { NombreDuplicadoError } from '../dominio/errores';

/** fila tal como sale de la consulta (la ciudad llega armada como objeto JSON) */
type FilaTerminal = {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
  ciudad: CiudadDeTerminal;
};

// terminales guarda solo ciudad_id; con el join se trae la ciudad completa para mostrar su nombre
const CONSULTA_BASE = `
  select t.id, t.nombre, t.direccion, t.activo,
         json_build_object('id', c.id, 'nombre', c.nombre, 'departamento', c.departamento) as ciudad
    from terminales t
    join ciudades c on c.id = t.ciudad_id`;

/** Aqui, y solo aqui, se escribe SQL del modulo terminales. */
export class PgTerminalRepositorio implements TerminalRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(): Promise<Terminal[]> {
    const resultado = await this.db.query<FilaTerminal>(`${CONSULTA_BASE} order by t.nombre`);
    return resultado.rows.map((fila) => Terminal.reconstruir(fila));
  }

  async buscarPorId(id: string): Promise<Terminal | null> {
    const resultado = await this.db.query<FilaTerminal>(`${CONSULTA_BASE} where t.id = $1`, [id]);
    const fila = resultado.rows[0];
    return fila ? Terminal.reconstruir(fila) : null;
  }

  async existeNombre(nombre: string): Promise<boolean> {
    const resultado = await this.db.query('select 1 from terminales where lower(nombre) = lower($1)', [
      nombre,
    ]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async buscarCiudad(ciudad_id: string): Promise<CiudadDeTerminal | null> {
    const resultado = await this.db.query<CiudadDeTerminal>(
      'select id, nombre, departamento from ciudades where id = $1 and activo',
      [ciudad_id],
    );
    return resultado.rows[0] ?? null;
  }

  async guardar(terminal: Terminal): Promise<void> {
    try {
      await this.db.query(
        `insert into terminales (id, nombre, ciudad_id, direccion, activo)
         values ($1, $2, $3, $4, $5)`,
        [terminal.id, terminal.nombre, terminal.ciudad.id, terminal.direccion, terminal.activo],
      );
    } catch (error) {
      // si dos personas registran el mismo nombre al mismo tiempo, la base rechaza la segunda
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) {
        throw new NombreDuplicadoError(terminal.nombre);
      }
      throw error;
    }
  }
}
