import { TramoInvalidoError, ViajeNoDisponibleError } from './erroresViaje';

/**
 * TRAMO: el pedazo de ruta que viaja un pasajero, de la parada "desde" a la parada "hasta".
 *
 * Reglas que usan la busqueda, la disponibilidad y la venta:
 *  - el tramo va de una parada de la ruta a otra POSTERIOR;
 *  - la hora de paso por una parada = salida del viaje + minutos desde el origen;
 *  - el precio del tramo es proporcional al tiempo y se redondea a Bs 0,50.
 */

export type ParadaDelViaje = {
  orden: number;
  minutos_desde_origen: number;
  terminal: string;
  ciudad: string;
};

export type TramoResuelto = {
  origen: ParadaDelViaje;
  destino: ParadaDelViaje;
  /** minutos que dura el tramo */
  minutos: number;
};

export function resolverTramo(paradas: ParadaDelViaje[], desde: number, hasta: number): TramoResuelto {
  if (!Number.isInteger(desde) || !Number.isInteger(hasta) || desde >= hasta) {
    throw new TramoInvalidoError();
  }
  const origen = paradas.find((p) => p.orden === desde);
  const destino = paradas.find((p) => p.orden === hasta);
  if (!origen || !destino) {
    throw new TramoInvalidoError('Alguna de las paradas elegidas no pertenece a la ruta del viaje');
  }
  return { origen, destino, minutos: destino.minutos_desde_origen - origen.minutos_desde_origen };
}

/** hora estimada en que el bus pasa por una parada */
export function horaDePaso(fecha_salida: Date, minutos_desde_origen: number): Date {
  return new Date(fecha_salida.getTime() + minutos_desde_origen * 60_000);
}

/**
 * Un tramo se vende solo si el viaje esta programado y el bus todavia no paso por la parada de subida.
 */
export function exigirTramoALaVenta(
  estado_viaje: string,
  fecha_salida: Date,
  origen: ParadaDelViaje,
  ahora: Date,
): void {
  if (estado_viaje !== 'programado') {
    throw new ViajeNoDisponibleError(`El viaje esta ${estado_viaje.replace('_', ' ')} y ya no se vende`);
  }
  if (horaDePaso(fecha_salida, origen.minutos_desde_origen) <= ahora) {
    throw new ViajeNoDisponibleError('El bus ya paso por la parada de subida');
  }
}

/**
 * Precio del tramo: precio del recorrido completo × (minutos del tramo ÷ minutos de la ruta),
 * redondeado a Bs 0,50. Nunca baja de Bs 0,50 ni supera el precio completo.
 */
export function precioDeTramo(precioCompleto: number, minutosTramo: number, duracionRuta: number): number {
  if (duracionRuta <= 0 || minutosTramo <= 0) {
    throw new TramoInvalidoError();
  }
  const proporcional = (precioCompleto * minutosTramo) / duracionRuta;
  // el pequeno ajuste evita errores de redondeo con decimales (por ejemplo 47.4999999)
  const redondeado = Math.round(proporcional * 2 + 1e-9) / 2;
  return Math.min(precioCompleto, Math.max(0.5, redondeado));
}
