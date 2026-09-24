/**
 * Ejecuta un archivo .sql de la carpeta supabase/ contra la base del .env.
 * Uso:
 *   npm run db:semilla   -> supabase/seed.sql (datos de prueba, se puede repetir)
 *   npm run db:demo      -> supabase/demo.sql (viajes de hoy y los proximos 6 dias)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { crearPool } from './baseDeDatos';
import { config } from './config';

async function main(): Promise<void> {
  const archivo = process.argv[2];
  if (!archivo) throw new Error('Indica el archivo, por ejemplo: seed.sql');

  const sql = readFileSync(resolve(__dirname, '../../../supabase', archivo), 'utf8');
  const pool = crearPool(config.DATABASE_URL);
  try {
    await pool.query(sql);
    console.log(`Listo: se ejecuto supabase/${archivo}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
