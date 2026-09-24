import type { RutaDetalle, RutaRepositorio } from '../dominio/RutaRepositorio';
import { RutaNoEncontradaError } from '../dominio/errores';

/** Caso de uso: ver una ruta con sus paradas */
export class ObtenerRuta {
  constructor(private readonly rutas: RutaRepositorio) {}

  async ejecutar(id: string): Promise<RutaDetalle> {
    const ruta = await this.rutas.buscarPorId(id);
    if (!ruta) throw new RutaNoEncontradaError(id);
    return ruta;
  }
}
