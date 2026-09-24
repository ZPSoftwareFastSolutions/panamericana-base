import { generarCroquisEstandar } from '../dominio/Croquis';
import type { PisoEstandar } from '../dominio/Croquis';
import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import { BusNoEncontradoError, CroquisExistenteError } from '../dominio/errores';
import type { CroquisDelBus } from './ObtenerCroquis';
import { leerCroquis } from './ObtenerCroquis';

/**
 * Caso de uso: generar el croquis estandar de un bus nuevo.
 * Solo se permite si el bus todavia no tiene asientos (no se pisan asientos que ya pudieron venderse).
 */
export class GenerarCroquis {
  constructor(private readonly croquis: CroquisRepositorio) {}

  async ejecutar(bus_id: string, pisos: PisoEstandar[]): Promise<CroquisDelBus> {
    const bus = await this.croquis.buscarBus(bus_id);
    if (!bus) throw new BusNoEncontradoError(bus_id);

    if ((await this.croquis.listarAsientos(bus_id)).length > 0) {
      throw new CroquisExistenteError();
    }

    const asientos = generarCroquisEstandar(pisos, bus, await this.croquis.tiposDeAsiento());
    await this.croquis.guardarAsientos(bus_id, asientos);
    return leerCroquis(this.croquis, bus);
  }
}
