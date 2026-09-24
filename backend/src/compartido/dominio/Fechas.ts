/**
 * FECHAS SIN HORA (AAAA-MM-DD): dias de La Paz, como los elige el usuario.
 * Se calculan en UTC para que el cambio de hora del servidor no mueva el dia.
 */
const DIA_MS = 24 * 60 * 60 * 1000;

export function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10);
}

/** dias que hay de una fecha a otra (positivo si "hasta" es posterior) */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / DIA_MS);
}
