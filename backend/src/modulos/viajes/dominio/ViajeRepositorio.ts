import type { ParadaDelViaje } from '../../../compartido/dominio/Tramo';
import type { BusParaProgramar, NuevoViaje, RutaParaProgramar, TarifaEntrada } from './Programacion';

/** un viaje tal como lo ve el backoffice */
export type ViajeResumen = {
  id: string;
  fecha_salida: string;
  fecha_llegada_estimada: string;
  estado: string;
  ruta: { id: string; nombre: string };
  bus: { id: string; placa: string };
  tarifas: TarifaEntrada[];
  total_asientos: number;
  asientos_vendidos: number;
};

/** un viaje que pasa por la ciudad de origen y despues por la de destino en la fecha buscada */
export type CandidatoBusqueda = {
  viaje_id: string;
  ruta: { id: string; nombre: string };
  bus: { id: string; placa: string };
  fecha_salida: Date;
  duracion_ruta: number;
  origen: ParadaDelViaje;
  destino: ParadaDelViaje;
  /** solo las tarifas de los tipos de asiento que tiene el bus */
  tarifas: TarifaEntrada[];
  asientos_libres: number;
};

/** lo necesario para mostrar el croquis de un tramo */
export type ViajeConParadas = {
  id: string;
  estado: string;
  fecha_salida: Date;
  numero_pisos: number;
  duracion_ruta: number;
  paradas: ParadaDelViaje[];
  tarifas: TarifaEntrada[];
};

export type AsientoDelTramo = {
  id: string;
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
  /** true si un pasaje pagado o una reserva vigente usa el asiento en un tramo que se cruza */
  ocupado: boolean;
};

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface ViajeRepositorio {
  listar(desde: string): Promise<ViajeResumen[]>;
  buscarPorId(id: string): Promise<ViajeResumen | null>;
  datosParaProgramar(ruta_id: string, bus_id: string): Promise<{ ruta: RutaParaProgramar | null; bus: BusParaProgramar | null }>;
  /** true si el bus tiene otro viaje programado o en ruta que se cruza con ese horario */
  busOcupado(bus_id: string, salida: Date, llegada: Date): Promise<boolean>;
  guardar(viaje: NuevoViaje): Promise<void>;

  /** estado, salida y tipos de asiento del bus del viaje (null si no existe) */
  datosParaEditarTarifas(
    viaje_id: string,
  ): Promise<{ estado: string; fecha_salida: Date; placa: string; tipos_asiento: string[] } | null>;
  /** reemplaza todas las tarifas del viaje en una transaccion */
  reemplazarTarifas(viaje_id: string, tarifas: TarifaEntrada[]): Promise<void>;

  /** fecha en formato AAAA-MM-DD, en hora de La Paz */
  buscarCandidatos(ciudad_origen_id: string, ciudad_destino_id: string, fecha: string): Promise<CandidatoBusqueda[]>;
  buscarConParadas(viaje_id: string): Promise<ViajeConParadas | null>;
  liberarReservasVencidas(viaje_id: string): Promise<void>;
  asientosDelTramo(viaje_id: string, desde: number, hasta: number): Promise<AsientoDelTramo[]>;
}
