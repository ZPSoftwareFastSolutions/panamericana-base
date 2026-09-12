/**
 * Verifica que el backend pueda conectarse a la base de datos.
 * Uso: npm run db:verificar
 */
import { crearPool } from './baseDeDatos';
import { config } from './config';

async function main(): Promise<void> {
  const pool = crearPool(config.DATABASE_URL);

  try {
    const version = await pool.query<{ version: string }>('select version()');
    console.log('Conexion correcta:', version.rows[0]?.version?.split(',')[0]);

    const tablas = await pool.query<{ tabla: string }>(
      `select table_name as tabla
         from information_schema.tables
        where table_schema = 'public'
        order by table_name`,
    );
    console.log(`Tablas (${tablas.rowCount}):`, tablas.rows.map((f) => f.tabla).join(', '));

    const buses = await pool.query<{ total: string }>('select count(*) as total from buses');
    console.log('Buses registrados:', buses.rows[0]?.total);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('No se pudo conectar a la base de datos.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
