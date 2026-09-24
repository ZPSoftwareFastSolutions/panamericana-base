import type { ModeloDemanda } from './ModeloDemanda';

/** de donde sale el modelo entrenado (un JSON junto al adaptador) */
export interface FuenteDelModelo {
  cargar(): Promise<ModeloDemanda>;
}

export type CapacidadDelDia = { ruta_id: string; fecha: string; capacidad: number; viajes: number };

/** lo que el modulo necesita leer de la base */
export interface PrediccionRepositorio {
  rutasActivas(): Promise<{ id: string; nombre: string }[]>;
  /** asientos de los viajes programados o en ruta, por ruta y dia de La Paz, entre dos fechas AAAA-MM-DD */
  capacidadProgramada(desde: string, hasta: string): Promise<CapacidadDelDia[]>;
  /** pasajes pagados por dia de salida en los ultimos dias (solo dias con ventas), por ruta */
  historialDeVentas(desde: string, hasta: string): Promise<{ ruta_id: string; dias_con_ventas: number; promedio: number }[]>;
}
