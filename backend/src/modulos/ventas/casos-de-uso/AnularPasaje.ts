import { exigirAnulable } from '../dominio/Anulacion';
import type { PasajeRepositorio } from '../dominio/PasajeRepositorio';
import { PasajeNoAnulableError, PasajeNoEncontradoError } from '../dominio/errores';
import type { PasajePublico } from './ObtenerPasaje';
import { aBoleto } from './ObtenerPasaje';

/**
 * Caso de uso: anular un pasaje en taquilla.
 * Pasos: 1) el pasaje existe · 2) el dominio revisa estado y plazo
 *        3) el repositorio anula y reembolsa en una transaccion (si otro lo anulo antes: 409)
 */
export class AnularPasaje {
  constructor(
    private readonly pasajes: PasajeRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(codigo: string): Promise<{ pasaje: PasajePublico; reembolso: number }> {
    const buscado = codigo.trim().toUpperCase();
    const pasaje = await this.pasajes.buscarPorCodigo(buscado);
    if (!pasaje) throw new PasajeNoEncontradoError(codigo);

    exigirAnulable({ estado: pasaje.estado, hora_subida: new Date(pasaje.viaje.origen.hora) }, this.ahora());

    const anulado = await this.pasajes.anular(pasaje.codigo, `REEMBOLSO-${pasaje.codigo}`);
    if (!anulado) throw new PasajeNoAnulableError('procesado');

    const actualizado = await this.pasajes.buscarPorCodigo(pasaje.codigo);
    if (!actualizado) throw new PasajeNoEncontradoError(codigo);
    return { pasaje: aBoleto(actualizado), reembolso: pasaje.precio };
  }
}
