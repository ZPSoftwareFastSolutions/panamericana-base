import type { Bus } from '../dominio/Bus';
import type { BusRepositorio } from '../dominio/BusRepositorio';

/** Caso de uso: listar todos los buses de la flota */
export class ListarBuses {
  constructor(private readonly buses: BusRepositorio) {}

  async ejecutar(): Promise<Bus[]> {
    return this.buses.listar();
  }
}
