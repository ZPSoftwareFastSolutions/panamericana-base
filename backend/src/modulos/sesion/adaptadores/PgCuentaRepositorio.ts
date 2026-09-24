import type { Pool } from 'pg';
import type { Cuenta } from '../dominio/Cuenta';
import type { CuentaRepositorio } from '../dominio/puertos';

/** SQL del modulo sesion: la cuenta activa con sus datos personales y sus roles */
export class PgCuentaRepositorio implements CuentaRepositorio {
  constructor(private readonly db: Pool) {}

  async buscarActiva(id: string): Promise<Cuenta | null> {
    const resultado = await this.db.query<Cuenta>(
      `select u.id, u.correo, p.nombres, p.apellidos,
              coalesce(array_agg(ur.rol order by ur.rol) filter (where ur.rol is not null), '{}') as roles
         from usuarios u
         join personas p on p.id = u.persona_id
         left join usuarios_roles ur on ur.usuario_id = u.id
        where u.id = $1 and u.activo
        group by u.id, p.id`,
      [id],
    );
    return resultado.rows[0] ?? null;
  }
}
