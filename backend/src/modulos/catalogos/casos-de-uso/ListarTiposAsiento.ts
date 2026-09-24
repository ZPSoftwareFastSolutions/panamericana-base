import type { ElementoCatalogo } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** Caso de uso: listar los tipos de asiento activos (normal, semicama, cama) */
export class ListarTiposAsiento {
  constructor(private readonly catalogos: CatalogoRepositorio) {}

  async ejecutar(): Promise<ElementoCatalogo[]> {
    return this.catalogos.listarTiposAsiento();
  }
}
