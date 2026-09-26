import type { TipoPasajero } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** Caso de uso: listar las tarifas diferenciadas activas (general, adulto mayor, discapacidad, menor) */
export class ListarTiposPasajero {
  constructor(private readonly catalogos: CatalogoRepositorio) {}

  async ejecutar(): Promise<TipoPasajero[]> {
    return this.catalogos.listarTiposPasajero();
  }
}
