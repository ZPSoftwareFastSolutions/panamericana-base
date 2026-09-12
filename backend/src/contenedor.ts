/**
 * composition root: el UNICO lugar donde se usa "new" para conectar piezas.
 * se ira llenando conforme se creen los modulos.
 * ver ARQUITECTURA_CLEAN.md, seccion 6.5
 *
 * ejemplo:
 *   const pool = crearPool(config.DATABASE_URL);
 *   const busRepositorio = new PgBusRepositorio(pool);
 *   export const registrarBus = new RegistrarBus(busRepositorio);
 */
export {};
