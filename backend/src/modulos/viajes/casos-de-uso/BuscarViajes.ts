import { horaDePaso, precioDeTramo } from '../../../compartido/dominio/Tramo';
import type { ParadaDelViaje } from '../../../compartido/dominio/Tramo';
import type { CandidatoBusqueda, ViajeRepositorio } from '../dominio/ViajeRepositorio';
import { BusquedaInvalidaError } from '../dominio/errores';

export type PuntoDelTramo = { orden: number; terminal: string; ciudad: string; hora: string };

export type ResultadoBusqueda = {
  viaje_id: string;
  ruta: { id: string; nombre: string };
  bus: { id: string; placa: string };
  origen: PuntoDelTramo;
  destino: PuntoDelTramo;
  duracion_min: number;
  tarifas_tramo: { tipo_asiento: string; precio: number }[];
  precio_desde: number;
  asientos_libres: number;
};

export function puntoDelTramo(fecha_salida: Date, parada: ParadaDelViaje): PuntoDelTramo {
  return {
    orden: parada.orden,
    terminal: parada.terminal,
    ciudad: parada.ciudad,
    hora: horaDePaso(fecha_salida, parada.minutos_desde_origen).toISOString(),
  };
}

/**
 * Caso de uso: buscar viajes por ciudad de origen, ciudad de destino y fecha.
 * Encuentra tambien los TRAMOS intermedios: un viaje La Paz → Cochabamba sirve para ir a Oruro.
 * El precio de cada tipo de asiento se calcula para el tramo (proporcional al tiempo).
 */
export class BuscarViajes {
  constructor(private readonly viajes: ViajeRepositorio) {}

  async ejecutar(entrada: { origen: string; destino: string; fecha: string }): Promise<ResultadoBusqueda[]> {
    if (entrada.origen === entrada.destino) {
      throw new BusquedaInvalidaError('El destino debe ser distinto del origen');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada.fecha)) {
      throw new BusquedaInvalidaError('La fecha debe tener el formato AAAA-MM-DD');
    }

    const candidatos = await this.viajes.buscarCandidatos(entrada.origen, entrada.destino, entrada.fecha);
    return candidatos
      .filter((c) => c.tarifas.length > 0)
      .map((c) => this.aResultado(c))
      .sort((a, b) => a.origen.hora.localeCompare(b.origen.hora));
  }

  private aResultado(c: CandidatoBusqueda): ResultadoBusqueda {
    const minutos = c.destino.minutos_desde_origen - c.origen.minutos_desde_origen;
    const tarifas_tramo = c.tarifas
      .map((t) => ({ tipo_asiento: t.tipo_asiento, precio: precioDeTramo(t.precio, minutos, c.duracion_ruta) }))
      .sort((a, b) => a.precio - b.precio);

    return {
      viaje_id: c.viaje_id,
      ruta: c.ruta,
      bus: c.bus,
      origen: puntoDelTramo(c.fecha_salida, c.origen),
      destino: puntoDelTramo(c.fecha_salida, c.destino),
      duracion_min: minutos,
      tarifas_tramo,
      precio_desde: tarifas_tramo[0]!.precio,
      asientos_libres: c.asientos_libres,
    };
  }
}
