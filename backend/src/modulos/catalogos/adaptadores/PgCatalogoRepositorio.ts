import type { Pool } from 'pg';
import type { Ciudad, ElementoCatalogo, TipoPasajero } from '../dominio/Catalogo';
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

  async listarTiposAsiento(): Promise<ElementoCatalogo[]> {
    const resultado = await this.db.query<ElementoCatalogo>(
      `select codigo, nombre
         from tipos_asiento
        where activo
        order by orden`,
    );
    return resultado.rows;
  }

  async listarTiposPasajero(): Promise<TipoPasajero[]> {
    const resultado = await this.db.query<TipoPasajero>(
      `select codigo, nombre, descuento_porcentaje::float8 as descuento_porcentaje, requisito
         from tipos_pasajero
        where activo
        order by orden`,
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
