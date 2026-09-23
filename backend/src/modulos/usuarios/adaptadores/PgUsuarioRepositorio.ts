import type { Pool } from 'pg';
import { CODIGOS_PG, codigoPg } from '../../../compartido/adaptadores/pg/erroresPg';
import { guardarPersona } from '../../../compartido/adaptadores/pg/personasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import { Usuario } from '../dominio/Usuario';
import type { UsuarioRepositorio } from '../dominio/UsuarioRepositorio';
import { CorreoDuplicadoError } from '../dominio/errores';

/** fila tal como sale de la consulta: cuenta + persona + lista de roles */
type FilaUsuario = {
  id: string;
  correo: string;
  activo: boolean;
  roles: string[];
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
};

// usuarios guarda la cuenta; personas, los datos; usuarios_roles, los roles (se juntan en una lista)
const CONSULTA_BASE = `
  select u.id, u.correo, u.activo,
         coalesce(array_agg(ur.rol order by ur.rol) filter (where ur.rol is not null), '{}') as roles,
         p.tipo_documento, p.numero_documento, p.nombres, p.apellidos, p.telefono
    from usuarios u
    join personas p on p.id = u.persona_id
    left join usuarios_roles ur on ur.usuario_id = u.id`;

const AGRUPAR = 'group by u.id, p.id';

/** Aqui, y solo aqui, se escribe SQL del modulo usuarios. */
export class PgUsuarioRepositorio implements UsuarioRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(): Promise<Usuario[]> {
    const resultado = await this.db.query<FilaUsuario>(
      `${CONSULTA_BASE} ${AGRUPAR} order by p.apellidos, p.nombres`,
    );
    return resultado.rows.map((fila) => Usuario.reconstruir(fila));
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const resultado = await this.db.query<FilaUsuario>(
      `${CONSULTA_BASE} where u.id = $1 ${AGRUPAR}`,
      [id],
    );
    const fila = resultado.rows[0];
    return fila ? Usuario.reconstruir(fila) : null;
  }

  async existeCorreo(correo: string): Promise<boolean> {
    const resultado = await this.db.query('select 1 from usuarios where correo = $1', [correo]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async existeDocumento(
    tipo_documento: TipoDocumento,
    numero_documento: string,
  ): Promise<boolean> {
    const resultado = await this.db.query(
      `select 1
         from usuarios u
         join personas p on p.id = u.persona_id
        where p.tipo_documento = $1 and p.numero_documento = $2`,
      [tipo_documento, numero_documento],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  async rolesExistentes(roles: string[]): Promise<string[]> {
    // "= any($1)" compara contra todos los valores de la lista recibida
    const resultado = await this.db.query<{ codigo: string }>(
      'select codigo from roles where activo and codigo = any($1)',
      [roles],
    );
    return resultado.rows.map((fila) => fila.codigo);
  }

  async guardar(usuario: Usuario): Promise<void> {
    try {
      // tres inserts (persona + cuenta + roles): o se guardan todos o ninguno
      await enTransaccion(this.db, async (conexion) => {
        const persona_id = await guardarPersona(conexion, { ...usuario, fecha_nacimiento: null });

        await conexion.query(
          'insert into usuarios (id, persona_id, correo, activo) values ($1, $2, $3, $4)',
          [usuario.id, persona_id, usuario.correo, usuario.activo],
        );

        for (const rol of usuario.roles) {
          await conexion.query('insert into usuarios_roles (usuario_id, rol) values ($1, $2)', [
            usuario.id,
            rol,
          ]);
        }
      });
    } catch (error) {
      // si dos administradores registran el mismo correo a la vez, la base rechaza el segundo
      if (codigoPg(error) === CODIGOS_PG.VALOR_REPETIDO) {
        throw new CorreoDuplicadoError(usuario.correo);
      }
      throw error;
    }
  }
}
