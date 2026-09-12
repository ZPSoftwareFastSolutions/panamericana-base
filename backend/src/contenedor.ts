/**
 * COMPOSITION ROOT: el unico lugar donde se usa "new" para conectar las piezas.
 * Aqui se decide que implementacion real recibe cada caso de uso.
 *
 * Al agregar un modulo nuevo: crear su repositorio y sus casos de uso aqui,
 * y registrarlos en rutas.ts
 */
import { crearPool } from './infraestructura/baseDeDatos';
import { config } from './infraestructura/config';
import { PgBusRepositorio } from './modulos/buses/adaptadores/PgBusRepositorio';
import { ListarBuses } from './modulos/buses/casos-de-uso/ListarBuses';
import { RegistrarBus } from './modulos/buses/casos-de-uso/RegistrarBus';

const pool = crearPool(config.DATABASE_URL);

// modulo: buses
const busRepositorio = new PgBusRepositorio(pool);

export const casosDeUso = {
  listarBuses: new ListarBuses(busRepositorio),
  registrarBus: new RegistrarBus(busRepositorio),
};
