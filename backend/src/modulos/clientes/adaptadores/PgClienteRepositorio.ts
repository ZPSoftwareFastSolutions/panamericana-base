import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { guardarPersona } from '../../../compartido/adaptadores/pg/personasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import { Cliente } from '../dominio/Cliente';
import type { ClienteRepositorio } from '../dominio/ClienteRepositorio';
import { ClienteDuplicadoError } from '../dominio/errores';

/** fila tal como sale del join de clientes con personas (mismos nombres que las columnas) */
type FilaCliente = {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  fecha_nacimiento: string | null;
};

// clientes solo guarda persona_id: los datos personales se traen con el join
// la fecha se pide como texto (::text) para recibir "2001-05-31" y no un objeto Date
const CONSULTA_BASE = `
  select cl.id, p.tipo_documento, p.numero_documento, p.nombres, p.apellidos,
         p.telefono, p.correo, p.fecha_nacimiento::text
    from clientes cl
    join personas p on p.id = cl.persona_id`;

/** Aqui, y solo aqui, se escribe SQL del modulo clientes. */
export class PgClienteRepositorio implements ClienteRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(): Promise<Cliente[]> {
    const resultado = await this.db.query<FilaCliente>(
      `${CONSULTA_BASE} order by p.apellidos, p.nombres`,
    );
    return resultado.rows.map((fila) => Cliente.reconstruir(fila));
  }

  async buscarPorDocumento(
    tipo_documento: TipoDocumento,
    numero_documento: string,
  ): Promise<Cliente | null> {
    const resultado = await this.db.query<FilaCliente>(
      `${CONSULTA_BASE} where p.tipo_documento = $1 and p.numero_documento = $2`,
      [tipo_documento, numero_documento],
    );
    const fila = resultado.rows[0];
    return fila ? Cliente.reconstruir(fila) : null;
  }

  async guardar(cliente: Cliente): Promise<void> {
    try {
      // dos inserts (persona + cliente): van juntos para que no quede uno sin el otro
      await enTransaccion(this.db, async (conexion) => {
        const persona_id = await guardarPersona(conexion, cliente);
        await conexion.query('insert into clientes (id, persona_id) values ($1, $2)', [
          cliente.id,
          persona_id,
        ]);
      });
    } catch (error) {
      // clientes.persona_id es unico: si dos vendedores registran a la misma persona a la vez
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) {
        throw new ClienteDuplicadoError(cliente.tipo_documento, cliente.numero_documento);
      }
      throw error;
    }
  }
}
