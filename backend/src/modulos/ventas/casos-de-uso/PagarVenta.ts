import { reservaVencida } from '../dominio/Venta';
import type { VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import { ReservaExpiradaError, VentaNoEncontradaError, VentaNoPendienteError } from '../dominio/errores';
import { ocultarDocumentos } from '../dominio/privacidad';

/**
 * Caso de uso: pagar (simulado) una venta pendiente y emitir sus pasajes.
 *
 * Pago simulado del MVP: la web registra "tarjeta" y la taquilla "efectivo", siempre aprobado,
 * con referencia SIMULADO-<codigo>. Pago, pasajes y venta cambian juntos en una transaccion.
 */
export class PagarVenta {
  constructor(
    private readonly ventas: VentaRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(
    codigo: string,
    opciones: { metodo: 'tarjeta' | 'efectivo'; mostrarDocumentos?: boolean } = { metodo: 'tarjeta' },
  ): Promise<VentaDetalle> {
    const venta = await this.ventas.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!venta) throw new VentaNoEncontradaError(codigo);
    // la reserva pudo liberarse antes (por ejemplo, alguien consulto el croquis despues del plazo)
    if (venta.estado === 'expirada') throw new ReservaExpiradaError();
    if (venta.estado !== 'pendiente') throw new VentaNoPendienteError(venta.estado);

    if (reservaVencida(venta, this.ahora())) {
      await this.ventas.expirar(venta.id);
      throw new ReservaExpiradaError();
    }

    const resultado = await this.ventas.registrarPago(venta.id, {
      metodo: opciones.metodo,
      referencia: `SIMULADO-${venta.codigo}`,
    });
    if (resultado === 'expirada') {
      // vencio justo mientras se procesaba el pago
      await this.ventas.expirar(venta.id);
      throw new ReservaExpiradaError();
    }
    if (resultado === 'no_pendiente') throw new VentaNoPendienteError('procesada');

    const pagada = await this.ventas.buscarPorCodigo(venta.codigo);
    if (!pagada) throw new VentaNoEncontradaError(codigo);
    return opciones.mostrarDocumentos ? pagada : ocultarDocumentos(pagada);
  }
}
