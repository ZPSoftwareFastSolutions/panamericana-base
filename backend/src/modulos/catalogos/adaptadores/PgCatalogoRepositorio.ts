import type { Pool } from 'pg';
import type { Ciudad, ElementoCatalogo } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** SQL del modulo catalogos. Solo se listan los valores activos. */
export class PgCatalogoRepositorio implements CatalogoRepositorio {
  constructor(private readonly db: Pool) {}

  async listarCiudades(): Promise<Ciudad[]> {
    const resultado = await this.db.query<Ciudad>(
      `select id, nombre, departamento
         from ciudades
        where activo
        order by nombre`,
    );
    return resultado.rows;
  }

  async listarTiposDocumento(): Promise<ElementoCatalogo[]> {
    const resultado = await this.db.query<ElementoCatalogo>(
      `select codigo, nombre
         from tipos_documento
        where activo
        order by nombre`,
    );
    return resultado.rows;
  }

  async listarRoles(): Promise<ElementoCatalogo[]> {
    const resultado = await this.db.query<ElementoCatalogo>(
      `select codigo, nombre
         from roles
        where activo
        order by nombre`,
    );
    return resultado.rows;
  }
}
