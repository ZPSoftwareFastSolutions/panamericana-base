/**
 * COMPOSITION ROOT: el unico lugar donde se usa "new" para conectar las piezas.
 * Aqui se decide que implementacion real recibe cada caso de uso.
 *
 * Al agregar un modulo nuevo: crear su repositorio y sus casos de uso aqui,
 * y registrarlos en rutas.ts
 */
import { limitarPorIp } from './compartido/adaptadores/http/limiteDePeticiones';
import { crearPool } from './infraestructura/baseDeDatos';
import { config } from './infraestructura/config';
import { hoyEnBolivia } from './infraestructura/reloj';
import { PgBusRepositorio } from './modulos/buses/adaptadores/PgBusRepositorio';
import { ListarBuses } from './modulos/buses/casos-de-uso/ListarBuses';
import { RegistrarBus } from './modulos/buses/casos-de-uso/RegistrarBus';
import { PgCatalogoRepositorio } from './modulos/catalogos/adaptadores/PgCatalogoRepositorio';
import { ListarCiudades } from './modulos/catalogos/casos-de-uso/ListarCiudades';
import { ListarRoles } from './modulos/catalogos/casos-de-uso/ListarRoles';
import { ListarTiposAsiento } from './modulos/catalogos/casos-de-uso/ListarTiposAsiento';
import { ListarTiposDocumento } from './modulos/catalogos/casos-de-uso/ListarTiposDocumento';
import { PgClienteRepositorio } from './modulos/clientes/adaptadores/PgClienteRepositorio';
import { BuscarClientePorDocumento } from './modulos/clientes/casos-de-uso/BuscarClientePorDocumento';
import { ListarClientes } from './modulos/clientes/casos-de-uso/ListarClientes';
import { RegistrarCliente } from './modulos/clientes/casos-de-uso/RegistrarCliente';
import { PgCroquisRepositorio } from './modulos/croquis/adaptadores/PgCroquisRepositorio';
import { CambiarTipoAsiento } from './modulos/croquis/casos-de-uso/CambiarTipoAsiento';
import { GenerarCroquis } from './modulos/croquis/casos-de-uso/GenerarCroquis';
import { ObtenerCroquis } from './modulos/croquis/casos-de-uso/ObtenerCroquis';
import { RegistrarAsiento } from './modulos/croquis/casos-de-uso/RegistrarAsiento';
import { PgEncomiendaRepositorio } from './modulos/encomiendas/adaptadores/PgEncomiendaRepositorio';
import { CambiarEstadoEncomienda } from './modulos/encomiendas/casos-de-uso/CambiarEstadoEncomienda';
import { ListarEncomiendas } from './modulos/encomiendas/casos-de-uso/ListarEncomiendas';
import { ObtenerEncomienda } from './modulos/encomiendas/casos-de-uso/ObtenerEncomienda';
import { RegistrarEncomienda } from './modulos/encomiendas/casos-de-uso/RegistrarEncomienda';
import { SeguirEncomienda } from './modulos/encomiendas/casos-de-uso/SeguirEncomienda';
import { PgPanelRepositorio } from './modulos/panel/adaptadores/PgPanelRepositorio';
import { ObtenerIndicadores } from './modulos/panel/casos-de-uso/ObtenerIndicadores';
import { ArchivoModeloDemanda } from './modulos/prediccion/adaptadores/ArchivoModeloDemanda';
import { PgPrediccionRepositorio } from './modulos/prediccion/adaptadores/PgPrediccionRepositorio';
import { PredecirDemanda } from './modulos/prediccion/casos-de-uso/PredecirDemanda';
import { PgRutaRepositorio } from './modulos/rutas/adaptadores/PgRutaRepositorio';
import { ListarRutas } from './modulos/rutas/casos-de-uso/ListarRutas';
import { ObtenerRuta } from './modulos/rutas/casos-de-uso/ObtenerRuta';
import { RegistrarRuta } from './modulos/rutas/casos-de-uso/RegistrarRuta';
import { JoseVerificadorDeToken } from './modulos/sesion/adaptadores/JoseVerificadorDeToken';
import { PgCuentaRepositorio } from './modulos/sesion/adaptadores/PgCuentaRepositorio';
import { crearAutorizacion } from './modulos/sesion/adaptadores/middlewareSesion';
import { IdentificarUsuario } from './modulos/sesion/casos-de-uso/IdentificarUsuario';
import { PgTerminalRepositorio } from './modulos/terminales/adaptadores/PgTerminalRepositorio';
import { ListarTerminales } from './modulos/terminales/casos-de-uso/ListarTerminales';
import { ObtenerTerminal } from './modulos/terminales/casos-de-uso/ObtenerTerminal';
import { RegistrarTerminal } from './modulos/terminales/casos-de-uso/RegistrarTerminal';
import { PgUsuarioRepositorio } from './modulos/usuarios/adaptadores/PgUsuarioRepositorio';
import { ListarUsuarios } from './modulos/usuarios/casos-de-uso/ListarUsuarios';
import { RegistrarUsuario } from './modulos/usuarios/casos-de-uso/RegistrarUsuario';
import { PgPasajeRepositorio } from './modulos/ventas/adaptadores/PgPasajeRepositorio';
import { PgVentaRepositorio } from './modulos/ventas/adaptadores/PgVentaRepositorio';
import { AnularPasaje } from './modulos/ventas/casos-de-uso/AnularPasaje';
import { ObtenerPasaje } from './modulos/ventas/casos-de-uso/ObtenerPasaje';
import { ObtenerVenta } from './modulos/ventas/casos-de-uso/ObtenerVenta';
import { PagarVenta } from './modulos/ventas/casos-de-uso/PagarVenta';
import { ReservarAsientos } from './modulos/ventas/casos-de-uso/ReservarAsientos';
import { VenderEnTaquilla } from './modulos/ventas/casos-de-uso/VenderEnTaquilla';
import { PgViajeRepositorio } from './modulos/viajes/adaptadores/PgViajeRepositorio';
import { BuscarViajes } from './modulos/viajes/casos-de-uso/BuscarViajes';
import { ConsultarDisponibilidad } from './modulos/viajes/casos-de-uso/ConsultarDisponibilidad';
import { EditarTarifas } from './modulos/viajes/casos-de-uso/EditarTarifas';
import { ListarViajes } from './modulos/viajes/casos-de-uso/ListarViajes';
import { ProgramarViaje } from './modulos/viajes/casos-de-uso/ProgramarViaje';

const pool = crearPool(config.DATABASE_URL);

// repositorios: uno por modulo
const busRepositorio = new PgBusRepositorio(pool);
const catalogoRepositorio = new PgCatalogoRepositorio(pool);
const terminalRepositorio = new PgTerminalRepositorio(pool);
const usuarioRepositorio = new PgUsuarioRepositorio(pool);
const clienteRepositorio = new PgClienteRepositorio(pool);
const croquisRepositorio = new PgCroquisRepositorio(pool);
const rutaRepositorio = new PgRutaRepositorio(pool);
const viajeRepositorio = new PgViajeRepositorio(pool);
const ventaRepositorio = new PgVentaRepositorio(pool);
const pasajeRepositorio = new PgPasajeRepositorio(pool);
const encomiendaRepositorio = new PgEncomiendaRepositorio(pool);
const panelRepositorio = new PgPanelRepositorio(pool);
const prediccionRepositorio = new PgPrediccionRepositorio(pool);

// sesion: el token se verifica con el JWKS de Supabase y los roles salen de la base
const identificarUsuario = new IdentificarUsuario(
  new JoseVerificadorDeToken(config.SUPABASE_URL),
  new PgCuentaRepositorio(pool),
);

/** el middleware que protege las rutas (lo reciben los archivos de rutas de cada modulo) */
export const autorizacion = crearAutorizacion(identificarUsuario);

/** limite de reservas anonimas por IP (el portal no pide sesion para comprar) */
export const limiteReservas = limitarPorIp({
  maximo: config.LIMITE_RESERVAS_POR_HORA,
  ventanaMs: 60 * 60 * 1000,
});

// la venta del portal y la de taquilla usan los MISMOS casos de uso (mismo inventario)
const reservarAsientos = new ReservarAsientos(ventaRepositorio, config.MINUTOS_RESERVA_ASIENTO);
const pagarVenta = new PagarVenta(ventaRepositorio);

export const casosDeUso = {
  // modulo: buses
  listarBuses: new ListarBuses(busRepositorio),
  registrarBus: new RegistrarBus(busRepositorio),

  // modulo: catalogos
  listarCiudades: new ListarCiudades(catalogoRepositorio),
  listarTiposDocumento: new ListarTiposDocumento(catalogoRepositorio),
  listarRoles: new ListarRoles(catalogoRepositorio),
  listarTiposAsiento: new ListarTiposAsiento(catalogoRepositorio),

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

  // modulo: croquis
  obtenerCroquis: new ObtenerCroquis(croquisRepositorio),
  generarCroquis: new GenerarCroquis(croquisRepositorio),
  registrarAsiento: new RegistrarAsiento(croquisRepositorio),
  cambiarTipoAsiento: new CambiarTipoAsiento(croquisRepositorio),

  // modulo: rutas
  listarRutas: new ListarRutas(rutaRepositorio),
  obtenerRuta: new ObtenerRuta(rutaRepositorio),
  registrarRuta: new RegistrarRuta(rutaRepositorio),

  // modulo: viajes
  listarViajes: new ListarViajes(viajeRepositorio, hoyEnBolivia),
  programarViaje: new ProgramarViaje(viajeRepositorio),
  buscarViajes: new BuscarViajes(viajeRepositorio),
  consultarDisponibilidad: new ConsultarDisponibilidad(viajeRepositorio),
  editarTarifas: new EditarTarifas(viajeRepositorio),

  // modulo: ventas
  reservarAsientos,
  obtenerVenta: new ObtenerVenta(ventaRepositorio),
  pagarVenta,
  venderEnTaquilla: new VenderEnTaquilla(reservarAsientos, pagarVenta, ventaRepositorio),
  obtenerPasaje: new ObtenerPasaje(pasajeRepositorio),
  anularPasaje: new AnularPasaje(pasajeRepositorio),

  // modulo: encomiendas
  registrarEncomienda: new RegistrarEncomienda(encomiendaRepositorio),
  listarEncomiendas: new ListarEncomiendas(encomiendaRepositorio),
  obtenerEncomienda: new ObtenerEncomienda(encomiendaRepositorio),
  cambiarEstadoEncomienda: new CambiarEstadoEncomienda(encomiendaRepositorio),
  seguirEncomienda: new SeguirEncomienda(encomiendaRepositorio),

  // modulo: panel
  obtenerIndicadores: new ObtenerIndicadores(panelRepositorio, hoyEnBolivia),

  // modulo: prediccion (el modelo entrenado se lee de un JSON; la API no entrena)
  predecirDemanda: new PredecirDemanda(new ArchivoModeloDemanda(), prediccionRepositorio, hoyEnBolivia),
};
