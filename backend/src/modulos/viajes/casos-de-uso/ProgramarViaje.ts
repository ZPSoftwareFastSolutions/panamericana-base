import { programarViaje } from '../dominio/Programacion';
import type { TarifaEntrada } from '../dominio/Programacion';
import type { ViajeRepositorio, ViajeResumen } from '../dominio/ViajeRepositorio';
import { BusOcupadoError, ViajeInvalidoError } from '../dominio/errores';

export type EntradaProgramarViaje = {
  ruta_id: string;
  bus_id: string;
  fecha_salida: string;
  tarifas: TarifaEntrada[];
};

/**
 * Caso de uso: programar un viaje con sus tarifas.
 * Pasos: 1) ruta y bus existen · 2) la entidad valida fechas y tarifas
 *        3) el bus no tiene otro viaje en ese horario · 4) guardar viaje + tarifas juntos
 */
export class ProgramarViaje {
  constructor(
    private readonly viajes: ViajeRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(entrada: EntradaProgramarViaje): Promise<ViajeResumen> {
    const { ruta, bus } = await this.viajes.datosParaProgramar(entrada.ruta_id, entrada.bus_id);
    if (!ruta) throw new ViajeInvalidoError('La ruta elegida no existe');
    if (!bus) throw new ViajeInvalidoError('El bus elegido no existe');

    const viaje = programarViaje(
      { ruta, bus, fecha_salida: new Date(entrada.fecha_salida), tarifas: entrada.tarifas },
      this.ahora(),
    );

    if (await this.viajes.busOcupado(bus.id, viaje.fecha_salida, viaje.fecha_llegada_estimada)) {
      throw new BusOcupadoError(bus.placa);
    }

    await this.viajes.guardar(viaje);

    const guardado = await this.viajes.buscarPorId(viaje.id);
    if (!guardado) throw new Error('El viaje no se encontro despues de guardarlo');
    return guardado;
  }
}
