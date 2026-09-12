/**
 * REGISTRO DE RUTAS: aqui se conectan los routers de cada modulo con el servidor.
 * Al crear un modulo nuevo se agrega una linea aqui.
 */
import type { Express } from 'express';
import { casosDeUso } from './contenedor';
import { busRutas } from './modulos/buses/adaptadores/busRutas';

export function registrarRutas(app: Express): void {
  app.use(busRutas(casosDeUso));

  // siguientes modulos:
  // app.use(terminalRutas(casosDeUso));
  // app.use(rutaRutas(casosDeUso));
}
