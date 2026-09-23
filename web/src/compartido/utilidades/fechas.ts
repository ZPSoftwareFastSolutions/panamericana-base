/**
 * Fechas en hora de Bolivia (La Paz, UTC-4).
 * Sirve para que "hoy" sea el mismo dia para todos, sin depender de la zona de la computadora.
 */
const ZONA_BOLIVIA = 'America/La_Paz';

/** fecha de hoy en La Paz con el formato de los <input type="date">: "2026-09-23" */
export function hoyEnBolivia(): string {
  // el formato en-CA escribe las fechas como AAAA-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_BOLIVIA }).format(new Date());
}

/** convierte "2026-09-23" en "23/09/2026" para mostrarla */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}
