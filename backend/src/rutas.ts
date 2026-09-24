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
import { encomiendaRutas } from './modulos/encomiendas/adaptadores/encomiendaRutas';
import { panelRutas } from './modulos/panel/adaptadores/panelRutas';
import { prediccionRutas } from './modulos/prediccion/adaptadores/prediccionRutas';
import { rutaRutas } from './modulos/rutas/adaptadores/rutaRutas';
import { sesionRutas } from './modulos/sesion/adaptadores/sesionRutas';
import { terminalRutas } from './modulos/terminales/adaptadores/terminalRutas';
import { usuarioRutas } from './modulos/usuarios/adaptadores/usuarioRutas';
import { taquillaRutas } from './modulos/ventas/adaptadores/taquillaRutas';
import { ventaRutas } from './modulos/ventas/adaptadores/ventaRutas';
import { viajeRutas } from './modulos/viajes/adaptadores/viajeRutas';

export function registrarRutas(app: Express): void {
  // publicas (portal): catalogos, busqueda de viajes, asientos del tramo, compra como invitado,
  // boleto y seguimiento de encomiendas (encomiendaRutas mezcla publico y protegido)
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
  app.use(taquillaRutas(casosDeUso, autorizacion));
  app.use(encomiendaRutas(casosDeUso, autorizacion));
  app.use(panelRutas(casosDeUso, autorizacion));
  app.use(prediccionRutas(casosDeUso, autorizacion));
}
