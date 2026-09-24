import { ViajeNoEncontradoError } from '../../../compartido/dominio/erroresViaje';
import { reservarAsientos } from '../dominio/Venta';
import type { Canal, DatosPasajero } from '../dominio/Venta';
import type { VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import { ocultarDocumentos } from '../dominio/privacidad';

export type EntradaReserva = {
  viaje_id: string;
  orden_origen: number;
  orden_destino: number;
  pasajeros: DatosPasajero[];
};

/**
 * Caso de uso: reservar asientos de un tramo mientras el cliente paga.
 *
 * Las tres defensas contra la doble venta:
 *  1. retencion temporal: los pasajes nacen "reservado" con plazo (MINUTOS_RESERVA_ASIENTO);
 *  2. turno en la base: el repositorio bloquea el viaje dentro de la transaccion;
 *  3. restriccion por tramo: la base rechaza dos pasajes activos que se crucen -> 409.
 */
export class ReservarAsientos {
  constructor(
    private readonly ventas: VentaRepositorio,
    private readonly minutosDeReserva: number,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(
    entrada: EntradaReserva,
    opciones: { canal: Canal; usuario_id: string | null; mostrarDocumentos?: boolean } = {
      canal: 'web',
      usuario_id: null,
    },
  ): Promise<VentaDetalle> {
    const contexto = await this.ventas.contextoDeReserva(
      entrada.viaje_id,
      entrada.orden_origen,
      entrada.orden_destino,
    );
    if (!contexto) throw new ViajeNoEncontradoError(entrada.viaje_id);

    const venta = reservarAsientos(
      {
        viaje: contexto.viaje,
        asientos: contexto.asientos,
        orden_origen: entrada.orden_origen,
        orden_destino: entrada.orden_destino,
        pasajeros: entrada.pasajeros,
        canal: opciones.canal,
        usuario_id: opciones.usuario_id,
      },
      this.ahora(),
      this.minutosDeReserva,
    );

    await this.ventas.guardarReserva(venta);

    const guardada = await this.ventas.buscarPorCodigo(venta.codigo);
    if (!guardada) throw new Error('La venta no se encontro despues de guardarla');
    return opciones.mostrarDocumentos ? guardada : ocultarDocumentos(guardada);
  }
}
