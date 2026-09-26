import { ViajeInvalidoError } from './errores';

/**
 * PROGRAMACION DE UN VIAJE: un bus recorre una ruta a una fecha y hora.
 *
 * El precio vive SOLO en las tarifas (una por tipo de asiento del bus): el viaje no
 * tiene "precio base". La llegada no se guarda: es la salida + la duracion de la ruta.
 */

export type RutaParaProgramar = { id: string; nombre: string; activo: boolean; duracion_min: number };
export type BusParaProgramar = { id: string; placa: string; estado: string; tipos_asiento: string[] };
export type TarifaEntrada = { tipo_asiento: string; precio: number };

export type NuevoViaje = {
  id: string;
  ruta_id: string;
  bus_id: string;
  fecha_salida: Date;
  fecha_llegada_estimada: Date;
  tarifas: TarifaEntrada[];
};

const PRECIO_MAXIMO = 5000;

/**
 * Tarifas de un viaje: una sola por cada tipo de asiento que tiene el bus (ni mas ni menos),
 * mayor que 0, hasta el PRECIO_MAXIMO y con 2 decimales como maximo. La usan programar y editar.
 */
export function validarTarifas(tarifas: TarifaEntrada[], bus: { placa: string; tipos_asiento: string[] }): void {
  const tipos = tarifas.map((t) => t.tipo_asiento);
  if (new Set(tipos).size !== tipos.length) {
    throw new ViajeInvalidoError('Cada tipo de asiento lleva una sola tarifa');
  }
  const sobrantes = tipos.filter((tipo) => !bus.tipos_asiento.includes(tipo));
  if (sobrantes.length > 0) {
    throw new ViajeInvalidoError(`El bus ${bus.placa} no tiene asientos ${sobrantes.join(', ')}`);
  }
  const faltantes = bus.tipos_asiento.filter((tipo) => !tipos.includes(tipo));
  if (faltantes.length > 0) {
    throw new ViajeInvalidoError(`Falta la tarifa de los asientos: ${faltantes.join(', ')}`);
  }
  for (const tarifa of tarifas) {
    const centavos = Math.round(tarifa.precio * 100);
    if (!(tarifa.precio > 0) || tarifa.precio > PRECIO_MAXIMO || Math.abs(centavos - tarifa.precio * 100) > 1e-6) {
      throw new ViajeInvalidoError(
        `El precio ${tarifa.tipo_asiento} debe ser mayor que 0, hasta Bs ${PRECIO_MAXIMO} y con 2 decimales como máximo`,
      );
    }
  }
}

export function programarViaje(
  datos: { ruta: RutaParaProgramar; bus: BusParaProgramar; fecha_salida: Date; tarifas: TarifaEntrada[] },
  ahora: Date,
): NuevoViaje {
  const { ruta, bus, fecha_salida, tarifas } = datos;

  if (!ruta.activo) throw new ViajeInvalidoError(`La ruta "${ruta.nombre}" está inactiva`);
  if (bus.estado !== 'activo') {
    throw new ViajeInvalidoError(`El bus ${bus.placa} está en estado "${bus.estado}" y no puede viajar`);
  }
  if (bus.tipos_asiento.length === 0) {
    throw new ViajeInvalidoError(`El bus ${bus.placa} todavía no tiene croquis de asientos`);
  }
  if (Number.isNaN(fecha_salida.getTime()) || fecha_salida <= ahora) {
    throw new ViajeInvalidoError('La fecha de salida debe ser futura');
  }

  validarTarifas(tarifas, bus);

  return {
    id: crypto.randomUUID(),
    ruta_id: ruta.id,
    bus_id: bus.id,
    fecha_salida,
    fecha_llegada_estimada: new Date(fecha_salida.getTime() + ruta.duracion_min * 60_000),
    tarifas,
  };
}
