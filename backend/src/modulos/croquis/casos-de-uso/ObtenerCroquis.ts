import type { AsientoDelBus, BusDelCroquis } from '../dominio/Croquis';
import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import { BusNoEncontradoError } from '../dominio/errores';

export type CroquisDelBus = {
  bus_id: string;
  placa: string;
  numero_pisos: number;
  asientos: AsientoDelBus[];
};

/** arma el croquis de un bus (lo reutilizan los otros casos de uso del modulo) */
export async function leerCroquis(
  croquis: CroquisRepositorio,
  bus: BusDelCroquis,
): Promise<CroquisDelBus> {
  return {
    bus_id: bus.id,
    placa: bus.placa,
    numero_pisos: bus.numero_pisos,
    asientos: await croquis.listarAsientos(bus.id),
  };
}

/** Caso de uso: ver el croquis de un bus */
export class ObtenerCroquis {
  constructor(private readonly croquis: CroquisRepositorio) {}

  async ejecutar(bus_id: string): Promise<CroquisDelBus> {
    const bus = await this.croquis.buscarBus(bus_id);
    if (!bus) throw new BusNoEncontradoError(bus_id);
    return leerCroquis(this.croquis, bus);
  }
}
