export type EstadoViaje = 'programado' | 'en_ruta' | 'finalizado' | 'cancelado';

/** precio del recorrido completo para un tipo de asiento (tabla tarifas) */
export type Tarifa = {
  tipo_asiento: string;
  precio: number;
};

/**
 * un viaje programado tal como lo ve el backoffice.
 * La llegada estimada no se guarda: se calcula con la duracion de la ruta.
 */
export type Viaje = {
  id: string;
  fecha_salida: string;
  fecha_llegada_estimada: string;
  estado: EstadoViaje;
  ruta: { id: string; nombre: string };
  bus: { id: string; placa: string };
  tarifas: Tarifa[];
  /** asientos del bus y cuantos tienen al menos un pasaje activo */
  total_asientos: number;
  asientos_vendidos: number;
};

/** reemplaza las tarifas de un viaje programado: una por cada tipo de asiento del bus */
export type EditarTarifasEntrada = {
  tarifas: Tarifa[];
};

export type ProgramarViajeEntrada = {
  ruta_id: string;
  bus_id: string;
  /** fecha y hora de salida en formato ISO, por ejemplo "2026-10-01T08:00:00-04:00" */
  fecha_salida: string;
  tarifas: Tarifa[];
};

/** una parada del tramo que busca el cliente */
export type PuntoDelTramo = {
  orden: number;
  terminal: string;
  ciudad: string;
  /** hora estimada de paso por esa parada (ISO) */
  hora: string;
};

/** un viaje que sirve para ir de la ciudad de origen a la de destino */
export type ResultadoBusqueda = {
  viaje_id: string;
  ruta: { id: string; nombre: string };
  bus: { id: string; placa: string };
  origen: PuntoDelTramo;
  destino: PuntoDelTramo;
  duracion_min: number;
  /** precio del tramo por tipo de asiento (proporcional al tiempo, redondeado a Bs 0,50) */
  tarifas_tramo: Tarifa[];
  precio_desde: number;
  asientos_libres: number;
};

/** un asiento del croquis con su estado para el tramo elegido */
export type AsientoDisponible = {
  id: string;
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
  /** precio del tramo con la tarifa general */
  precio: number;
  /** el mismo precio con cada tarifa diferenciada ({ general: 47.5, adulto_mayor: 38, ... }) */
  precios_por_tarifa: Record<string, number>;
  disponible: boolean;
};

export type DisponibilidadTramo = {
  viaje_id: string;
  numero_pisos: number;
  origen: PuntoDelTramo;
  destino: PuntoDelTramo;
  asientos: AsientoDisponible[];
};
