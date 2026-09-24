/**
 * Fecha de hoy en Bolivia (La Paz, UTC-4) con el formato AAAA-MM-DD.
 * Se inyecta a los casos de uso que necesitan "hoy" (asi las pruebas pueden usar otra fecha).
 */
export function hoyEnBolivia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date());
}
