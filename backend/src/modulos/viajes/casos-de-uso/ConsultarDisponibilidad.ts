import { exigirTramoALaVenta, precioDeTramo, resolverTramo } from '../../../compartido/dominio/Tramo';
import { ViajeNoEncontradoError } from '../../../compartido/dominio/erroresViaje';
import type { ViajeRepositorio } from '../dominio/ViajeRepositorio';
import type { PuntoDelTramo } from './BuscarViajes';
import { puntoDelTramo } from './BuscarViajes';

export type AsientoDisponible = {
  id: string;
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
  precio: number;
  disponible: boolean;
};

export type DisponibilidadTramo = {
  viaje_id: string;
  numero_pisos: number;
  origen: PuntoDelTramo;
  destino: PuntoDelTramo;
  asientos: AsientoDisponible[];
};

/**
 * Caso de uso: ver que asientos estan libres PARA UN TRAMO.
 * Un asiento esta libre si ningun pasaje pagado ni reserva vigente lo usa en un tramo que se cruce.
 * Antes de consultar se liberan las reservas vencidas (asi se muestran como libres).
 */
export class ConsultarDisponibilidad {
  constructor(
    private readonly viajes: ViajeRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(viaje_id: string, desde: number, hasta: number): Promise<DisponibilidadTramo> {
    const viaje = await this.viajes.buscarConParadas(viaje_id);
    if (!viaje) throw new ViajeNoEncontradoError(viaje_id);

    const tramo = resolverTramo(viaje.paradas, desde, hasta);
    exigirTramoALaVenta(viaje.estado, viaje.fecha_salida, tramo.origen, this.ahora());

    await this.viajes.liberarReservasVencidas(viaje_id);
    const asientos = await this.viajes.asientosDelTramo(viaje_id, desde, hasta);

    return {
      viaje_id,
      numero_pisos: viaje.numero_pisos,
      origen: puntoDelTramo(viaje.fecha_salida, tramo.origen),
      destino: puntoDelTramo(viaje.fecha_salida, tramo.destino),
      asientos: asientos.map((asiento) => {
        const tarifa = viaje.tarifas.find((t) => t.tipo_asiento === asiento.tipo);
        return {
          id: asiento.id,
          numero: asiento.numero,
          piso: asiento.piso,
          fila: asiento.fila,
          columna: asiento.columna,
          tipo: asiento.tipo,
          // sin tarifa para su tipo, el asiento no se puede vender
          precio: tarifa ? precioDeTramo(tarifa.precio, tramo.minutos, viaje.duracion_ruta) : 0,
          disponible: !asiento.ocupado && tarifa !== undefined,
        };
      }),
    };
  }
}
