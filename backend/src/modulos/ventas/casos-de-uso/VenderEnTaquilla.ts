import type { VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import type { PagarVenta } from './PagarVenta';
import type { EntradaReserva, ReservarAsientos } from './ReservarAsientos';

/**
 * Caso de uso: vender en taquilla.
 *
 * Reutiliza EXACTAMENTE la reserva y el pago de la web: por eso la taquilla y el portal
 * comparten el mismo inventario y las mismas tres defensas contra la doble venta.
 * Solo cambian el canal ("taquilla"), el vendedor que la registra y el pago en efectivo.
 * El vendedor ve los documentos completos (los necesita para entregar el boleto).
 *
 * Reserva y cobro son dos pasos: si el cobro falla, la reserva recien hecha se libera
 * enseguida (no queda retenida 10 minutos bloqueando al propio vendedor).
 */
export class VenderEnTaquilla {
  constructor(
    private readonly reservar: ReservarAsientos,
    private readonly pagar: PagarVenta,
    private readonly ventas: Pick<VentaRepositorio, 'expirar'>,
  ) {}

  async ejecutar(entrada: EntradaReserva, vendedor_id: string): Promise<VentaDetalle> {
    const reservada = await this.reservar.ejecutar(entrada, {
      canal: 'taquilla',
      usuario_id: vendedor_id,
      mostrarDocumentos: true,
    });
    try {
      return await this.pagar.ejecutar(reservada.codigo, { metodo: 'efectivo', mostrarDocumentos: true });
    } catch (error) {
      await this.ventas.expirar(reservada.id);
      throw error;
    }
  }
}
