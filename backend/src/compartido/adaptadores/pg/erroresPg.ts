/**
 * Codigos de error de PostgreSQL que usan los repositorios.
 * Lista completa: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const CODIGOS_PG = {
  /** se intento guardar un valor que debe ser unico y ya existe */
  VALOR_REPETIDO: '23505',
  /** se hizo referencia a una fila que no existe (clave foranea) */
  REFERENCIA_INEXISTENTE: '23503',
  /** la restriccion de exclusion lo rechazo (por ejemplo, asiento ya vendido en ese tramo) */
  EXCLUSION: '23P01',
} as const;

/** devuelve el codigo de error de PostgreSQL, o undefined si el error no vino de la base */
export function codigoPg(error: unknown): string | undefined {
  return (error as { code?: string } | null)?.code;
}
