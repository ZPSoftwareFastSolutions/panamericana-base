import type { EstadoEncomienda } from '../dominio/Encomienda';
import type { EncomiendaDetalle, EncomiendaRepositorio } from '../dominio/EncomiendaRepositorio';
import { EncomiendaNoEncontradaError } from '../dominio/errores';

export type Seguimiento = {
  codigo_seguimiento: string;
  estado: EstadoEncomienda;
  terminal_origen: EncomiendaDetalle['terminal_origen'];
  terminal_destino: EncomiendaDetalle['terminal_destino'];
  creado_en: string;
  historial: { estado: EstadoEncomienda; fecha: string }[];
};

/**
 * Caso de uso: seguimiento PUBLICO por codigo.
 * Solo estado, terminales y fechas: ni nombres, ni documentos, ni observaciones del personal.
 */
export class SeguirEncomienda {
  constructor(private readonly encomiendas: EncomiendaRepositorio) {}

  async ejecutar(codigo: string): Promise<Seguimiento> {
    const encomienda = await this.encomiendas.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!encomienda) throw new EncomiendaNoEncontradaError(codigo);
    return {
      codigo_seguimiento: encomienda.codigo_seguimiento,
      estado: encomienda.estado,
      terminal_origen: encomienda.terminal_origen,
      terminal_destino: encomienda.terminal_destino,
      creado_en: encomienda.creado_en,
      historial: encomienda.historial.map((h) => ({ estado: h.estado, fecha: h.fecha })),
    };
  }
}
