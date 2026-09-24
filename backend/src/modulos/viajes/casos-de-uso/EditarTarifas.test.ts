import { describe, expect, it } from 'vitest';
import { ViajeNoDisponibleError, ViajeNoEncontradoError } from '../../../compartido/dominio/erroresViaje';
import type { TarifaEntrada } from '../dominio/Programacion';
import type { ViajeRepositorio, ViajeResumen } from '../dominio/ViajeRepositorio';
import { ViajeInvalidoError } from '../dominio/errores';
import { EditarTarifas } from './EditarTarifas';

const AHORA = new Date('2026-09-30T12:00:00Z');

/** repositorio falso: solo lo que usa este caso de uso */
class TarifasEnMemoria implements Partial<ViajeRepositorio> {
  viaje = { estado: 'programado', fecha_salida: new Date('2026-10-01T12:00:00Z'), placa: '2045KLP', tipos_asiento: ['cama', 'semicama'] };
  tarifas: TarifaEntrada[] = [];

  async datosParaEditarTarifas(id: string) {
    return id === 'viaje-1' ? this.viaje : null;
  }
  async reemplazarTarifas(_id: string, tarifas: TarifaEntrada[]) {
    this.tarifas = tarifas;
  }
  async buscarPorId(id: string) {
    return { id, tarifas: this.tarifas } as ViajeResumen;
  }
}

function crear() {
  const repositorio = new TarifasEnMemoria();
  return { repositorio, editar: new EditarTarifas(repositorio as unknown as ViajeRepositorio, () => AHORA) };
}

const nuevas = [
  { tipo_asiento: 'cama', precio: 130 },
  { tipo_asiento: 'semicama', precio: 99.5 },
];

describe('EditarTarifas', () => {
  it('reemplaza los precios de un viaje programado', async () => {
    const { editar, repositorio } = crear();

    const viaje = await editar.ejecutar('viaje-1', nuevas);

    expect(viaje.tarifas).toEqual(nuevas);
    expect(repositorio.tarifas).toEqual(nuevas);
  });

  it('exige una tarifa por cada tipo de asiento del bus, como al programar', async () => {
    const { editar } = crear();

    await expect(editar.ejecutar('viaje-1', [nuevas[0]!])).rejects.toThrow('Falta la tarifa de los asientos: semicama');
    await expect(editar.ejecutar('viaje-1', [...nuevas, { tipo_asiento: 'normal', precio: 50 }])).rejects.toThrow(
      ViajeInvalidoError,
    );
  });

  it('no cambia precios de un viaje que ya salio o no esta programado; 404 si no existe', async () => {
    const { editar, repositorio } = crear();

    repositorio.viaje = { ...repositorio.viaje, fecha_salida: new Date('2026-09-30T11:00:00Z') };
    await expect(editar.ejecutar('viaje-1', nuevas)).rejects.toThrow(ViajeNoDisponibleError);
    repositorio.viaje = { ...repositorio.viaje, fecha_salida: new Date('2026-10-01T12:00:00Z'), estado: 'cancelado' };
    await expect(editar.ejecutar('viaje-1', nuevas)).rejects.toThrow(ViajeNoDisponibleError);
    await expect(editar.ejecutar('otro', nuevas)).rejects.toThrow(ViajeNoEncontradoError);
  });
});
