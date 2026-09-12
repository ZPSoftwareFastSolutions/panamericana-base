import { Pool } from 'pg';

/** crea el pool de conexiones a postgresql (supabase, modo sesion) */
export function crearPool(urlConexion: string): Pool {
  return new Pool({
    connectionString: urlConexion,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}
