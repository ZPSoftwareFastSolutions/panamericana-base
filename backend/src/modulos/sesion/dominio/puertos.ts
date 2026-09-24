import type { Cuenta } from './Cuenta';

/**
 * PUERTOS del modulo sesion: lo que el caso de uso necesita, sin decir como se hace.
 * - VerificadorDeToken: en adaptadores/ se implementa con el JWKS de Supabase.
 * - CuentaRepositorio: en adaptadores/ se implementa con SQL.
 */

export interface VerificadorDeToken {
  /** devuelve el id del usuario (el "sub" del token) o lanza un error si el token no es valido */
  verificar(token: string): Promise<{ id: string }>;
}

export interface CuentaRepositorio {
  /** la cuenta ACTIVA con ese id y sus roles, o null si no existe o esta desactivada */
  buscarActiva(id: string): Promise<Cuenta | null>;
}
