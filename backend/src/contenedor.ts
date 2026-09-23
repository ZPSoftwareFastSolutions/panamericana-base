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
import { PgCatalogoRepositorio } from './modulos/catalogos/adaptadores/PgCatalogoRepositorio';
import { ListarCiudades } from './modulos/catalogos/casos-de-uso/ListarCiudades';
import { ListarRoles } from './modulos/catalogos/casos-de-uso/ListarRoles';
import { ListarTiposDocumento } from './modulos/catalogos/casos-de-uso/ListarTiposDocumento';
import { PgClienteRepositorio } from './modulos/clientes/adaptadores/PgClienteRepositorio';
import { BuscarClientePorDocumento } from './modulos/clientes/casos-de-uso/BuscarClientePorDocumento';
import { ListarClientes } from './modulos/clientes/casos-de-uso/ListarClientes';
import { RegistrarCliente } from './modulos/clientes/casos-de-uso/RegistrarCliente';
import { PgTerminalRepositorio } from './modulos/terminales/adaptadores/PgTerminalRepositorio';
import { ListarTerminales } from './modulos/terminales/casos-de-uso/ListarTerminales';
import { ObtenerTerminal } from './modulos/terminales/casos-de-uso/ObtenerTerminal';
import { RegistrarTerminal } from './modulos/terminales/casos-de-uso/RegistrarTerminal';
import { PgUsuarioRepositorio } from './modulos/usuarios/adaptadores/PgUsuarioRepositorio';
import { ListarUsuarios } from './modulos/usuarios/casos-de-uso/ListarUsuarios';
import { RegistrarUsuario } from './modulos/usuarios/casos-de-uso/RegistrarUsuario';

const pool = crearPool(config.DATABASE_URL);

// repositorios: uno por modulo
const busRepositorio = new PgBusRepositorio(pool);
const catalogoRepositorio = new PgCatalogoRepositorio(pool);
const terminalRepositorio = new PgTerminalRepositorio(pool);
const usuarioRepositorio = new PgUsuarioRepositorio(pool);
const clienteRepositorio = new PgClienteRepositorio(pool);

export const casosDeUso = {
  // modulo: buses
  listarBuses: new ListarBuses(busRepositorio),
  registrarBus: new RegistrarBus(busRepositorio),

  // modulo: catalogos
  listarCiudades: new ListarCiudades(catalogoRepositorio),
  listarTiposDocumento: new ListarTiposDocumento(catalogoRepositorio),
  listarRoles: new ListarRoles(catalogoRepositorio),

  // modulo: terminales
  listarTerminales: new ListarTerminales(terminalRepositorio),
  obtenerTerminal: new ObtenerTerminal(terminalRepositorio),
  registrarTerminal: new RegistrarTerminal(terminalRepositorio),

  // modulo: usuarios
  listarUsuarios: new ListarUsuarios(usuarioRepositorio),
  registrarUsuario: new RegistrarUsuario(usuarioRepositorio),

  // modulo: clientes
  listarClientes: new ListarClientes(clienteRepositorio),
  buscarClientePorDocumento: new BuscarClientePorDocumento(clienteRepositorio),
  registrarCliente: new RegistrarCliente(clienteRepositorio),
};
