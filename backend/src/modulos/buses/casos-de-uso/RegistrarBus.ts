import { Bus } from '../dominio/Bus';
import type { DatosNuevoBus } from '../dominio/Bus';
import type { BusRepositorio } from '../dominio/BusRepositorio';
import { PlacaDuplicadaError } from '../dominio/errores';

/** Caso de uso: registrar un bus nuevo en la flota */
export class RegistrarBus {
  constructor(private readonly buses: BusRepositorio) {}

  async ejecutar(entrada: DatosNuevoBus): Promise<Bus> {
    const bus = Bus.crear(entrada);

    if (await this.buses.existePlaca(bus.placa)) {
      throw new PlacaDuplicadaError(bus.placa);
    }

    await this.buses.guardar(bus);
    return bus;
  }
}
