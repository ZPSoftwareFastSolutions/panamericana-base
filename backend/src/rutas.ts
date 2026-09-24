/**
 * REGISTRO DE RUTAS: aqui se conectan los routers de cada modulo con el servidor.
 * Al crear un modulo nuevo se agrega una linea aqui.
 *
 * Los modulos con rutas protegidas reciben "autorizacion" (el middleware de sesion).
 */
import type { Express } from 'express';
import { autorizacion, casosDeUso, limiteReservas } from './contenedor';
import { busRutas } from './modulos/buses/adaptadores/busRutas';
import { catalogoRutas } from './modulos/catalogos/adaptadores/catalogoRutas';
import { clienteRutas } from './modulos/clientes/adaptadores/clienteRutas';
import { croquisRutas } from './modulos/croquis/adaptadores/croquisRutas';
import { rutaRutas } from './modulos/rutas/adaptadores/rutaRutas';
import { sesionRutas } from './modulos/sesion/adaptadores/sesionRutas';
import { terminalRutas } from './modulos/terminales/adaptadores/terminalRutas';
import { usuarioRutas } from './modulos/usuarios/adaptadores/usuarioRutas';
import { ventaRutas } from './modulos/ventas/adaptadores/ventaRutas';
import { viajeRutas } from './modulos/viajes/adaptadores/viajeRutas';

export function registrarRutas(app: Express): void {
  // publicas (portal): catalogos, busqueda de viajes, asientos del tramo y compra como invitado
  app.use(catalogoRutas(casosDeUso));
  app.use(ventaRutas(casosDeUso, limiteReservas));

  // con sesion y roles (backoffice)
  app.use(sesionRutas(autorizacion));
  app.use(busRutas(casosDeUso, autorizacion));
  app.use(croquisRutas(casosDeUso, autorizacion));
  app.use(terminalRutas(casosDeUso, autorizacion));
  app.use(usuarioRutas(casosDeUso, autorizacion));
  app.use(clienteRutas(casosDeUso, autorizacion));
  app.use(rutaRutas(casosDeUso, autorizacion));
  app.use(viajeRutas(casosDeUso, autorizacion));
}
