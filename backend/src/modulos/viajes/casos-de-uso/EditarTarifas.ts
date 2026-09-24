import { ViajeNoDisponibleError, ViajeNoEncontradoError } from '../../../compartido/dominio/erroresViaje';
import { validarTarifas } from '../dominio/Programacion';
import type { TarifaEntrada } from '../dominio/Programacion';
import type { ViajeRepositorio, ViajeResumen } from '../dominio/ViajeRepositorio';

/**
 * Caso de uso: cambiar los precios de un viaje ya programado.
 *
 * Solo mientras el viaje esta programado y todavia no salio. Los pasajes ya vendidos
 * conservan el precio que se cobro (cada pasaje guarda su precio): el cambio vale
 * para las ventas siguientes.
 */
export class EditarTarifas {
  constructor(
    private readonly viajes: ViajeRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(viaje_id: string, tarifas: TarifaEntrada[]): Promise<ViajeResumen> {
    const viaje = await this.viajes.datosParaEditarTarifas(viaje_id);
    if (!viaje) throw new ViajeNoEncontradoError(viaje_id);

    if (viaje.estado !== 'programado' || viaje.fecha_salida <= this.ahora()) {
      throw new ViajeNoDisponibleError('Solo se cambian los precios de un viaje programado que todavia no salio');
    }
    validarTarifas(tarifas, { placa: viaje.placa, tipos_asiento: viaje.tipos_asiento });

    await this.viajes.reemplazarTarifas(viaje_id, tarifas);

    const actualizado = await this.viajes.buscarPorId(viaje_id);
    if (!actualizado) throw new ViajeNoEncontradoError(viaje_id);
    return actualizado;
  }
}
