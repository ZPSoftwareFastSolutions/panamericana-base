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

/** "08:30" en hora de La Paz, a partir de una fecha ISO de la API */
export function horaEnBolivia(iso: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: ZONA_BOLIVIA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

/** "mié 01/10 08:30" en hora de La Paz */
export function fechaHoraEnBolivia(iso: string): string {
  const fecha = new Intl.DateTimeFormat('es-BO', {
    timeZone: ZONA_BOLIVIA,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(iso));
  return `${fecha} ${horaEnBolivia(iso)}`;
}

/** convierte una fecha y una hora elegidas en La Paz en un ISO con su zona: "2026-10-01T08:00:00-04:00" */
export function aIsoBolivia(fecha: string, hora: string): string {
  return `${fecha}T${hora}:00-04:00`;
}

/** 420 -> "7 h" · 150 -> "2 h 30 min" */
export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
