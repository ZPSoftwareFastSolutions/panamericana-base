import { ocultarDocumentos } from '../dominio/privacidad';
import type { VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import { VentaNoEncontradaError } from '../dominio/errores';

/** Caso de uso: ver una venta por su codigo (checkout, confirmacion y boleto) */
export class ObtenerVenta {
  constructor(private readonly ventas: VentaRepositorio) {}

  async ejecutar(codigo: string, opciones: { mostrarDocumentos?: boolean } = {}): Promise<VentaDetalle> {
    const venta = await this.ventas.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!venta) throw new VentaNoEncontradaError(codigo);
    return opciones.mostrarDocumentos ? venta : ocultarDocumentos(venta);
  }
}
