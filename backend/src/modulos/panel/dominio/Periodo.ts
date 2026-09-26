import { diasEntre, sumarDias } from '../../../compartido/dominio/Fechas';
import { PeriodoDelPanelInvalidoError } from './errores';

/**
 * PERIODO DEL PANEL: fechas de La Paz (AAAA-MM-DD). Por defecto, los ultimos 30 dias.
 * Un periodo va de "desde" a "hasta" (ambos incluidos) y dura como maximo un año.
 */
export const DIAS_POR_DEFECTO = 30;
const MAXIMO_DIAS = 366;

const esFechaValida = (fecha: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(fecha) && new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha;

export function resolverPeriodo(entrada: { desde?: string; hasta?: string }, hoy: string): { desde: string; hasta: string } {
  for (const fecha of [entrada.desde, entrada.hasta]) {
    if (fecha !== undefined && !esFechaValida(fecha)) {
      throw new PeriodoDelPanelInvalidoError('Las fechas deben ser días reales con el formato AAAA-MM-DD');
    }
  }
  const hasta = entrada.hasta ?? hoy;
  const desde = entrada.desde ?? sumarDias(hasta, -(DIAS_POR_DEFECTO - 1));
  if (desde > hasta) throw new PeriodoDelPanelInvalidoError('La fecha "desde" no puede ser posterior a "hasta"');
  if (diasEntre(desde, hasta) + 1 > MAXIMO_DIAS) {
    throw new PeriodoDelPanelInvalidoError(`El periodo puede tener hasta ${MAXIMO_DIAS} días`);
  }
  return { desde, hasta };
}

/** porcentaje con un decimal (0 si no hay base) */
export function porcentaje(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 1000) / 10 : 0;
}
