import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import {
  AsientoInvalidoError,
  AsientoNoEncontradoError,
  BusNoEncontradoError,
  CroquisEnUsoError,
} from '../dominio/errores';
import type { CroquisDelBus } from './ObtenerCroquis';
import { leerCroquis } from './ObtenerCroquis';

/**
 * Caso de uso: cambiar el tipo de un asiento desde el editor del croquis (por ejemplo, semicama -> cama).
 *
 * Regla: si el bus ya tiene viajes programados, cada uno debe tener precio para el tipo nuevo;
 * si no, ese asiento no se podria vender. Los pasajes ya vendidos no cambian (guardan su precio).
 */
export class CambiarTipoAsiento {
  constructor(private readonly croquis: CroquisRepositorio) {}

  async ejecutar(bus_id: string, asiento_id: string, tipo: string): Promise<CroquisDelBus> {
    const bus = await this.croquis.buscarBus(bus_id);
    if (!bus) throw new BusNoEncontradoError(bus_id);

    const tipos = await this.croquis.tiposDeAsiento();
    if (!tipos.includes(tipo)) {
      throw new AsientoInvalidoError(`El tipo "${tipo}" no existe. Usa: ${tipos.join(', ')}`);
    }

    const asiento = (await this.croquis.listarAsientos(bus_id)).find((a) => a.id === asiento_id);
    if (!asiento) throw new AsientoNoEncontradoError(asiento_id);

    if (asiento.tipo !== tipo) {
      const { viajesSinPrecio } = await this.croquis.cambiarTipo(bus_id, asiento_id, tipo);
      if (viajesSinPrecio > 0) throw new CroquisEnUsoError(bus.placa, tipo, viajesSinPrecio);
    }
    return leerCroquis(this.croquis, bus);
  }
}
