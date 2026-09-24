import { chocaConOtro, validarAsiento } from '../dominio/Croquis';
import type { DatosAsiento } from '../dominio/Croquis';
import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import { AsientoDuplicadoError, BusNoEncontradoError } from '../dominio/errores';
import type { CroquisDelBus } from './ObtenerCroquis';
import { leerCroquis } from './ObtenerCroquis';

/** Caso de uso: agregar un asiento suelto (por ejemplo, el asiento junto al chofer) */
export class RegistrarAsiento {
  constructor(private readonly croquis: CroquisRepositorio) {}

  async ejecutar(bus_id: string, asiento: DatosAsiento): Promise<CroquisDelBus> {
    const bus = await this.croquis.buscarBus(bus_id);
    if (!bus) throw new BusNoEncontradoError(bus_id);

    validarAsiento(asiento, bus, await this.croquis.tiposDeAsiento());

    const choque = chocaConOtro(asiento, await this.croquis.listarAsientos(bus_id));
    if (choque) throw new AsientoDuplicadoError(choque);

    await this.croquis.guardarAsientos(bus_id, [asiento]);
    return leerCroquis(this.croquis, bus);
  }
}
