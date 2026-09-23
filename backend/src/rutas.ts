/**
 * REGISTRO DE RUTAS: aqui se conectan los routers de cada modulo con el servidor.
 * Al crear un modulo nuevo se agrega una linea aqui.
 */
import type { Express } from 'express';
import { casosDeUso } from './contenedor';
import { busRutas } from './modulos/buses/adaptadores/busRutas';
import { catalogoRutas } from './modulos/catalogos/adaptadores/catalogoRutas';
import { clienteRutas } from './modulos/clientes/adaptadores/clienteRutas';
import { terminalRutas } from './modulos/terminales/adaptadores/terminalRutas';
import { usuarioRutas } from './modulos/usuarios/adaptadores/usuarioRutas';

export function registrarRutas(app: Express): void {
  app.use(busRutas(casosDeUso));
  app.use(catalogoRutas(casosDeUso));
  app.use(terminalRutas(casosDeUso));
  app.use(usuarioRutas(casosDeUso));
  app.use(clienteRutas(casosDeUso));

  // siguientes modulos (Sprint 2):
  // app.use(rutaRutas(casosDeUso));
  // app.use(viajeRutas(casosDeUso));
}
