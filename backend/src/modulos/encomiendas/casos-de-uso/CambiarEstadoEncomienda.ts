import { admiteViaje, exigirCambioDeEstado, requiereReembolso } from '../dominio/Encomienda';
import type { EstadoEncomienda } from '../dominio/Encomienda';
import type { EncomiendaRepositorio, EncomiendaVista } from '../dominio/EncomiendaRepositorio';
import {
  EncomiendaInvalidaError,
  EncomiendaNoEncontradaError,
  EstadoCambiadoError,
  ViajeNoSirveError,
} from '../dominio/errores';
import { aVista } from './ObtenerEncomienda';

export type EntradaCambioDeEstado = {
  estado: EstadoEncomienda;
  observacion?: string | null;
  viaje_id?: string | null;
};

/**
 * Caso de uso: avanzar el estado de una encomienda (despachar, llegar, entregar o cancelar).
 * Cada cambio queda en el historial con el usuario y la observacion.
 */
export class CambiarEstadoEncomienda {
  constructor(private readonly encomiendas: EncomiendaRepositorio) {}

  async ejecutar(codigo: string, entrada: EntradaCambioDeEstado, usuario_id: string): Promise<EncomiendaVista> {
    const buscado = codigo.trim().toUpperCase();
    const encomienda = await this.encomiendas.buscarPorCodigo(buscado);
    if (!encomienda) throw new EncomiendaNoEncontradaError(codigo);

    exigirCambioDeEstado(encomienda.estado, entrada.estado);

    const viaje_id = entrada.viaje_id ?? null;
    if (viaje_id) {
      if (!admiteViaje(entrada.estado)) {
        throw new EncomiendaInvalidaError('El viaje se indica solo al despachar la encomienda (en tránsito)');
      }
      const sirve = await this.encomiendas.viajeSirve(
        viaje_id,
        encomienda.terminal_origen.id,
        encomienda.terminal_destino.id,
      );
      if (!sirve) throw new ViajeNoSirveError();
    }

    const observacion = entrada.observacion?.trim() || null;
    if (observacion && observacion.length > 200) {
      throw new EncomiendaInvalidaError('La observación tiene 200 caracteres como máximo');
    }

    const guardado = await this.encomiendas.registrarCambio({
      encomienda_id: encomienda.id,
      estado_esperado: encomienda.estado,
      estado_nuevo: entrada.estado,
      observacion,
      usuario_id,
      viaje_id,
      reembolsar: requiereReembolso(entrada.estado),
    });
    if (!guardado) throw new EstadoCambiadoError();

    const actualizada = await this.encomiendas.buscarPorCodigo(buscado);
    if (!actualizada) throw new EncomiendaNoEncontradaError(codigo);
    return aVista(actualizada);
  }
}
