export { RUTAS_API } from './endpoints';
export type { RespuestaError, TipoDocumento } from './tipos/comunes';
export type { Bus, EstadoBus, RegistrarBusEntrada } from './tipos/bus';
export type { Ciudad, ElementoCatalogo } from './tipos/catalogo';
export type { RegistrarTerminalEntrada, Terminal } from './tipos/terminal';
export type { RegistrarUsuarioEntrada, Usuario } from './tipos/usuario';
export type { Cliente, RegistrarClienteEntrada } from './tipos/cliente';
export type { RolInterno, SesionUsuario } from './tipos/sesion';
export type {
  Asiento,
  Croquis,
  GenerarCroquisEntrada,
  PisoCroquisEntrada,
  RegistrarAsientoEntrada,
} from './tipos/croquis';
export type { ParadaRuta, ParadaRutaEntrada, RegistrarRutaEntrada, Ruta } from './tipos/ruta';
export type {
  AsientoDisponible,
  DisponibilidadTramo,
  EstadoViaje,
  ProgramarViajeEntrada,
  PuntoDelTramo,
  ResultadoBusqueda,
  Tarifa,
  Viaje,
} from './tipos/viaje';
export type {
  CanalVenta,
  EstadoPasaje,
  EstadoVenta,
  PagarVentaEntrada,
  PasajeDeVenta,
  PasajeroEntrada,
  ReservarEntrada,
  Venta,
} from './tipos/venta';
