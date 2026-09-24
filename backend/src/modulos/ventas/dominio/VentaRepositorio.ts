import type { AsientoParaReservar, VentaNueva, ViajeParaReservar } from './Venta';

type PuntoDelTramo = { orden: number; terminal: string; ciudad: string; hora: string };

/** una venta tal como se muestra (checkout, confirmacion, boleto) */
export type VentaDetalle = {
  id: string;
  codigo: string;
  canal: string;
  estado: string;
  total: number;
  reservado_hasta: string | null;
  creado_en: string;
  viaje: {
    id: string;
    ruta: { id: string; nombre: string };
    bus: { id: string; placa: string };
    fecha_salida: string;
    origen: PuntoDelTramo;
    destino: PuntoDelTramo;
  } | null;
  pasajes: {
    codigo: string;
    estado: string;
    precio: number;
    asiento: { numero: number; piso: number; tipo: string };
    pasajero: { tipo_documento: string; numero_documento: string; nombres: string; apellidos: string };
  }[];
};

export type ResultadoPago = 'pagada' | 'expirada' | 'no_pendiente';

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface VentaRepositorio {
  /**
   * el viaje con sus paradas y tarifas, y los asientos del bus marcando los ocupados
   * en ese tramo (las reservas vencidas no cuentan). null si el viaje no existe.
   */
  contextoDeReserva(
    viaje_id: string,
    desde: number,
    hasta: number,
  ): Promise<{ viaje: ViajeParaReservar; asientos: AsientoParaReservar[] } | null>;

  /**
   * guarda la venta pendiente, los clientes y los pasajes reservados en UNA transaccion,
   * con el viaje bloqueado. Si un asiento se ocupo mientras tanto: AsientoNoDisponibleError.
   */
  guardarReserva(venta: VentaNueva): Promise<void>;

  buscarPorCodigo(codigo: string): Promise<VentaDetalle | null>;

  /** marca como expirados los pasajes todavia reservados y la venta como expirada */
  expirar(venta_id: string): Promise<void>;

  /**
   * cobra la venta en UNA transaccion: pago aprobado, pasajes pagados y venta pagada.
   * Solo si sigue pendiente y ningun pasaje vencio.
   */
  registrarPago(venta_id: string, pago: { metodo: string; referencia: string }): Promise<ResultadoPago>;
}
