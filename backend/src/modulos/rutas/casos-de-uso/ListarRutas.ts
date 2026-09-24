import type { RutaDetalle, RutaRepositorio } from '../dominio/RutaRepositorio';

/** Caso de uso: listar las rutas con sus paradas */
export class ListarRutas {
  constructor(private readonly rutas: RutaRepositorio) {}

  async ejecutar(): Promise<RutaDetalle[]> {
    return this.rutas.listar();
  }
}
