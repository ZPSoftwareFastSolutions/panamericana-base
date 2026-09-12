import { describe, expect, it } from 'vitest';
import type { Bus } from '../dominio/Bus';
import type { BusRepositorio } from '../dominio/BusRepositorio';
import { NumeroPisosInvalidoError, PlacaDuplicadaError } from '../dominio/errores';
import { RegistrarBus } from './RegistrarBus';

/** repositorio falso: guarda en memoria, sin base de datos */
class BusRepositorioEnMemoria implements BusRepositorio {
  buses: Bus[] = [];

  async listar(): Promise<Bus[]> {
    return this.buses;
  }

  async existePlaca(placa: string): Promise<boolean> {
    return this.buses.some((bus) => bus.placa === placa);
  }

  async guardar(bus: Bus): Promise<void> {
    this.buses.push(bus);
  }
}

describe('RegistrarBus', () => {
  const datosValidos = { placa: 'ABC-123', marca: 'Volvo', modelo: 'B450R', numero_pisos: 2 };

  it('registra un bus y lo deja en estado activo', async () => {
    const repositorio = new BusRepositorioEnMemoria();
    const registrarBus = new RegistrarBus(repositorio);

    const bus = await registrarBus.ejecutar(datosValidos);

    expect(bus.placa).toBe('ABC-123');
    expect(bus.estado).toBe('activo');
    expect(repositorio.buses).toHaveLength(1);
  });

  it('no permite dos buses con la misma placa', async () => {
    const registrarBus = new RegistrarBus(new BusRepositorioEnMemoria());
    await registrarBus.ejecutar(datosValidos);

    await expect(registrarBus.ejecutar({ ...datosValidos, placa: 'abc-123' })).rejects.toThrow(
      PlacaDuplicadaError,
    );
  });

  it('rechaza un bus con 3 pisos', async () => {
    const registrarBus = new RegistrarBus(new BusRepositorioEnMemoria());

    await expect(registrarBus.ejecutar({ ...datosValidos, numero_pisos: 3 })).rejects.toThrow(
      NumeroPisosInvalidoError,
    );
  });
});
