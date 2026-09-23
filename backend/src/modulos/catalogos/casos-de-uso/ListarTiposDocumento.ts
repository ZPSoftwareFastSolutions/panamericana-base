import type { ElementoCatalogo } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** Caso de uso: listar los tipos de documento activos (ci, ce, pasaporte) */
export class ListarTiposDocumento {
  constructor(private readonly catalogos: CatalogoRepositorio) {}

  async ejecutar(): Promise<ElementoCatalogo[]> {
    return this.catalogos.listarTiposDocumento();
  }
}
