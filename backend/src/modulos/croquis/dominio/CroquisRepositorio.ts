import type { AsientoDelBus, BusDelCroquis, DatosAsiento } from './Croquis';

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface CroquisRepositorio {
  buscarBus(id: string): Promise<BusDelCroquis | null>;
  listarAsientos(bus_id: string): Promise<AsientoDelBus[]>;
  /** codigos activos del catalogo tipos_asiento */
  tiposDeAsiento(): Promise<string[]>;
  /** guarda todos los asientos juntos (o ninguno) */
  guardarAsientos(bus_id: string, asientos: DatosAsiento[]): Promise<void>;
}
