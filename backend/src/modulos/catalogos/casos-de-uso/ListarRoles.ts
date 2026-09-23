import type { ElementoCatalogo } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** Caso de uso: listar los roles que se pueden asignar a un usuario */
export class ListarRoles {
  constructor(private readonly catalogos: CatalogoRepositorio) {}

  async ejecutar(): Promise<ElementoCatalogo[]> {
    return this.catalogos.listarRoles();
  }
}
