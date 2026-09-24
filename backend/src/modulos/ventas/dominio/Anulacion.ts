import { AnulacionFueraDePlazoError, PasajeNoAnulableError } from './errores';

/**
 * ANULACION de un pasaje (solo en taquilla).
 *
 * Reglas del MVP:
 *  - solo se anula un pasaje PAGADO (una reserva sin pagar simplemente vence);
 *  - hasta 2 horas antes de que el bus pase por la parada donde sube el pasajero;
 *  - el asiento queda libre para ese tramo y se devuelve el precio completo del pasaje.
 */
export const HORAS_ANTES_PARA_ANULAR = 2;

/** ultimo momento en que se puede anular un pasaje que sube a esa hora */
export function limiteDeAnulacion(hora_subida: Date): Date {
  return new Date(hora_subida.getTime() - HORAS_ANTES_PARA_ANULAR * 60 * 60_000);
}

export function exigirAnulable(pasaje: { estado: string; hora_subida: Date }, ahora: Date): void {
  if (pasaje.estado !== 'pagado') throw new PasajeNoAnulableError(pasaje.estado);
  if (ahora > limiteDeAnulacion(pasaje.hora_subida)) {
    throw new AnulacionFueraDePlazoError(HORAS_ANTES_PARA_ANULAR);
  }
}
