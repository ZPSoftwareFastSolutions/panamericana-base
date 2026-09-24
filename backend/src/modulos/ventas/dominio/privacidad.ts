import { enmascararDocumento } from '../../../compartido/dominio/Codigo';
import type { VentaDetalle } from './VentaRepositorio';

/**
 * En las paginas PUBLICAS (checkout, boleto) el documento del pasajero se muestra oculto: ****351.
 * El personal de taquilla si lo ve completo.
 */
export function ocultarDocumentos(venta: VentaDetalle): VentaDetalle {
  return {
    ...venta,
    pasajes: venta.pasajes.map((p) => ({
      ...p,
      pasajero: { ...p.pasajero, numero_documento: enmascararDocumento(p.pasajero.numero_documento) },
    })),
  };
}
