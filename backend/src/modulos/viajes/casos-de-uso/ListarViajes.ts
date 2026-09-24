import type { ViajeRepositorio, ViajeResumen } from '../dominio/ViajeRepositorio';
import { BusquedaInvalidaError } from '../dominio/errores';

/** Caso de uso: listar los viajes desde una fecha (por defecto, hoy en La Paz) */
export class ListarViajes {
  constructor(
    private readonly viajes: ViajeRepositorio,
    private readonly hoy: () => string,
  ) {}

  async ejecutar(desde?: string): Promise<ViajeResumen[]> {
    const fecha = desde ?? this.hoy();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BusquedaInvalidaError('La fecha debe tener el formato AAAA-MM-DD');
    }
    return this.viajes.listar(fecha);
  }
}
