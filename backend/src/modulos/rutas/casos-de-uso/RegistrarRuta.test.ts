import { describe, expect, it } from 'vitest';
import { DatoObligatorioError } from '../../../compartido/dominio/erroresComunes';
import type { NuevaRuta } from '../dominio/Ruta';
import type { RutaDetalle, RutaRepositorio } from '../dominio/RutaRepositorio';
import { RutaDuplicadaError, RutaInvalidaError, TerminalInvalidaError } from '../dominio/errores';
import { RegistrarRuta } from './RegistrarRuta';

const TERMINALES = ['t-la-paz', 't-oruro', 't-cochabamba'];

class RutasEnMemoria implements RutaRepositorio {
  guardadas: NuevaRuta[] = [];

  async listar(): Promise<RutaDetalle[]> {
    return this.guardadas.map((r) => this.aDetalle(r));
  }
  async buscarPorId(id: string) {
    const ruta = this.guardadas.find((r) => r.id === id);
    return ruta ? this.aDetalle(ruta) : null;
  }
  async existeNombre(nombre: string) {
    return this.guardadas.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase());
  }
  async terminalesActivas(ids: string[]) {
    return ids.filter((id) => TERMINALES.includes(id));
  }
  async guardar(ruta: NuevaRuta) {
    this.guardadas.push(ruta);
  }
  private aDetalle(ruta: NuevaRuta): RutaDetalle {
    return {
      id: ruta.id,
      nombre: ruta.nombre,
      activo: true,
      duracion_estimada_min: ruta.paradas.at(-1)!.minutos_desde_origen,
      distancia_km: ruta.paradas.at(-1)!.km_desde_origen,
      paradas: ruta.paradas.map((p) => ({
        orden: p.orden,
        minutos_desde_origen: p.minutos_desde_origen,
        km_desde_origen: p.km_desde_origen,
        terminal: { id: p.terminal_id, nombre: p.terminal_id, ciudad: '' },
      })),
    };
  }
}

const valida = {
  nombre: 'La Paz - Cochabamba',
  paradas: [
    { terminal_id: 't-la-paz', minutos_desde_origen: 0, km_desde_origen: 0 },
    { terminal_id: 't-oruro', minutos_desde_origen: 210, km_desde_origen: 190 },
    { terminal_id: 't-cochabamba', minutos_desde_origen: 420, km_desde_origen: 380 },
  ],
};

describe('RegistrarRuta', () => {
  it('numera las paradas en orden y calcula la duracion con la ultima', async () => {
    const ruta = await new RegistrarRuta(new RutasEnMemoria()).ejecutar(valida);

    expect(ruta.paradas.map((p) => p.orden)).toEqual([1, 2, 3]);
    expect(ruta.duracion_estimada_min).toBe(420);
  });

  it('exige al menos dos paradas', async () => {
    await expect(
      new RegistrarRuta(new RutasEnMemoria()).ejecutar({ ...valida, paradas: valida.paradas.slice(0, 1) }),
    ).rejects.toThrow(RutaInvalidaError);
  });

  it('el origen empieza en 0 minutos y los minutos siempre crecen', async () => {
    const registrar = new RegistrarRuta(new RutasEnMemoria());
    const [origen, oruro, cochabamba] = valida.paradas;

    await expect(
      registrar.ejecutar({ ...valida, paradas: [{ ...origen!, minutos_desde_origen: 5 }, oruro!, cochabamba!] }),
    ).rejects.toThrow(RutaInvalidaError);
    await expect(
      registrar.ejecutar({ ...valida, paradas: [origen!, { ...oruro!, minutos_desde_origen: 500 }, cochabamba!] }),
    ).rejects.toThrow(RutaInvalidaError);
  });

  it('no repite una terminal dentro de la ruta', async () => {
    const [origen, oruro] = valida.paradas;
    await expect(
      new RegistrarRuta(new RutasEnMemoria()).ejecutar({
        ...valida,
        paradas: [origen!, oruro!, { ...origen!, minutos_desde_origen: 600 }],
      }),
    ).rejects.toThrow(RutaInvalidaError);
  });

  it('rechaza terminales que no existen', async () => {
    const [origen, oruro] = valida.paradas;
    await expect(
      new RegistrarRuta(new RutasEnMemoria()).ejecutar({
        ...valida,
        paradas: [origen!, oruro!, { terminal_id: 't-potosi', minutos_desde_origen: 600 }],
      }),
    ).rejects.toThrow(TerminalInvalidaError);
  });

  it('no repite el nombre (sin importar mayusculas) y exige nombre', async () => {
    const registrar = new RegistrarRuta(new RutasEnMemoria());
    await registrar.ejecutar(valida);

    await expect(registrar.ejecutar({ ...valida, nombre: 'la paz - cochabamba' })).rejects.toThrow(
      RutaDuplicadaError,
    );
    await expect(registrar.ejecutar({ ...valida, nombre: '  ' })).rejects.toThrow(
      DatoObligatorioError,
    );
  });
});
