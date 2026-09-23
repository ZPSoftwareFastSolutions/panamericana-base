import type { Ciudad } from '../dominio/Catalogo';
import type { CatalogoRepositorio } from '../dominio/CatalogoRepositorio';

/** Caso de uso: listar las ciudades activas (para elegir la ciudad de una terminal) */
export class ListarCiudades {
  constructor(private readonly catalogos: CatalogoRepositorio) {}

  async ejecutar(): Promise<Ciudad[]> {
    return this.catalogos.listarCiudades();
  }
}
