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

    const objetos = await pool.query<{ nombre: string; tipo: string }>(
      `select table_name as nombre, table_type as tipo
         from information_schema.tables
        where table_schema = 'public'
        order by table_name`,
    );
    const tablas = objetos.rows.filter((f) => f.tipo === 'BASE TABLE').map((f) => f.nombre);
    const vistas = objetos.rows.filter((f) => f.tipo === 'VIEW').map((f) => f.nombre);
    console.log(`Tablas (${tablas.length}):`, tablas.join(', '));
    console.log(`Vistas (${vistas.length}):`, vistas.join(', '));

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
