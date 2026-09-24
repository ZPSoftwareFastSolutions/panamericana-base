import { limiteDeAnulacion } from '../dominio/Anulacion';
import type { PasajeDetalle, PasajeRepositorio } from '../dominio/PasajeRepositorio';
import { PasajeNoEncontradoError } from '../dominio/errores';
import { ocultarDocumentoDelPasajero } from '../dominio/privacidad';

export type PasajePublico = PasajeDetalle & { anulable_hasta: string };

/** el boleto: documento oculto y la hora limite para anular */
export function aBoleto(pasaje: PasajeDetalle): PasajePublico {
  return {
    ...ocultarDocumentoDelPasajero(pasaje),
    anulable_hasta: limiteDeAnulacion(new Date(pasaje.viaje.origen.hora)).toISOString(),
  };
}

/** Caso de uso: ver un pasaje por su codigo (boleto con QR y consulta publica) */
export class ObtenerPasaje {
  constructor(private readonly pasajes: PasajeRepositorio) {}

  async ejecutar(codigo: string): Promise<PasajePublico> {
    const pasaje = await this.pasajes.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!pasaje) throw new PasajeNoEncontradoError(codigo);
    return aBoleto(pasaje);
  }
}
