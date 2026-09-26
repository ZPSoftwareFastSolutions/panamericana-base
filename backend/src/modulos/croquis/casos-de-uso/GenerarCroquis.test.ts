import { describe, expect, it } from 'vitest';
import type { AsientoDelBus, BusDelCroquis, DatosAsiento } from '../dominio/Croquis';
import type { CroquisRepositorio } from '../dominio/CroquisRepositorio';
import {
  AsientoDuplicadoError,
  AsientoInvalidoError,
  AsientoNoEncontradoError,
  BusNoEncontradoError,
  CroquisEnUsoError,
  CroquisExistenteError,
} from '../dominio/errores';
import { CambiarTipoAsiento } from './CambiarTipoAsiento';
import { GenerarCroquis } from './GenerarCroquis';
import { RegistrarAsiento } from './RegistrarAsiento';

const BUS: BusDelCroquis = { id: 'bus-1', placa: '2045KLP', numero_pisos: 2 };

class CroquisEnMemoria implements CroquisRepositorio {
  asientos: AsientoDelBus[] = [];

  async buscarBus(id: string) {
    return id === BUS.id ? BUS : null;
  }
  async listarAsientos(bus_id: string) {
    return bus_id === BUS.id ? this.asientos : [];
  }
  async tiposDeAsiento() {
    return ['normal', 'semicama', 'cama'];
  }
  async guardarAsientos(_bus_id: string, asientos: DatosAsiento[]) {
    this.asientos.push(...asientos.map((a) => ({ ...a, id: `a-${a.numero}` })));
  }
  sinTarifa = 0;
  async cambiarTipo(_bus_id: string, asiento_id: string, tipo: string) {
    if (this.sinTarifa > 0) return { viajesSinPrecio: this.sinTarifa };
    this.asientos = this.asientos.map((a) => (a.id === asiento_id ? { ...a, tipo } : a));
    return { viajesSinPrecio: 0 };
  }
}

describe('GenerarCroquis', () => {
  it('numera de corrido: primero el piso 1 y después el piso 2, con el pasillo libre', async () => {
    const repositorio = new CroquisEnMemoria();

    const croquis = await new GenerarCroquis(repositorio).ejecutar(BUS.id, [
      { piso: 2, filas: 2, asientos_por_fila: 4, tipo: 'semicama' },
      { piso: 1, filas: 1, asientos_por_fila: 3, tipo: 'cama' },
    ]);

    expect(croquis.asientos).toHaveLength(11);
    // piso 1, cama: columnas 1 | 3 4 (la 2 es el pasillo)
    expect(croquis.asientos.slice(0, 3).map((a) => [a.numero, a.piso, a.columna])).toEqual([
      [1, 1, 1],
      [2, 1, 3],
      [3, 1, 4],
    ]);
    // piso 2, semicama: columnas 1 2 | 4 5 (la 3 es el pasillo)
    expect(croquis.asientos.slice(3, 7).map((a) => a.columna)).toEqual([1, 2, 4, 5]);
    expect(croquis.asientos.at(-1)).toMatchObject({ numero: 11, piso: 2, fila: 2, tipo: 'semicama' });
  });

  it('no genera si el bus ya tiene asientos', async () => {
    const repositorio = new CroquisEnMemoria();
    const generar = new GenerarCroquis(repositorio);
    await generar.ejecutar(BUS.id, [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'normal' }]);

    await expect(
      generar.ejecutar(BUS.id, [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'normal' }]),
    ).rejects.toThrow(CroquisExistenteError);
  });

  it('rechaza un piso que el bus no tiene y un tipo fuera del catalogo', async () => {
    const generar = new GenerarCroquis(new CroquisEnMemoria());

    await expect(
      generar.ejecutar(BUS.id, [{ piso: 3, filas: 1, asientos_por_fila: 4, tipo: 'normal' }]),
    ).rejects.toThrow(AsientoInvalidoError);
    await expect(
      generar.ejecutar(BUS.id, [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'ejecutivo' }]),
    ).rejects.toThrow(AsientoInvalidoError);
  });

  it('responde "no encontrado" si el bus no existe', async () => {
    await expect(
      new GenerarCroquis(new CroquisEnMemoria()).ejecutar('otro', [
        { piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'normal' },
      ]),
    ).rejects.toThrow(BusNoEncontradoError);
  });
});

describe('RegistrarAsiento', () => {
  it('agrega un asiento suelto y rechaza repetir número o posición', async () => {
    const repositorio = new CroquisEnMemoria();
    const registrar = new RegistrarAsiento(repositorio);

    await registrar.ejecutar(BUS.id, { numero: 1, piso: 1, fila: 1, columna: 1, tipo: 'normal' });

    await expect(
      registrar.ejecutar(BUS.id, { numero: 1, piso: 1, fila: 2, columna: 1, tipo: 'normal' }),
    ).rejects.toThrow(AsientoDuplicadoError);
    await expect(
      registrar.ejecutar(BUS.id, { numero: 2, piso: 1, fila: 1, columna: 1, tipo: 'normal' }),
    ).rejects.toThrow(AsientoDuplicadoError);
    expect(repositorio.asientos).toHaveLength(1);
  });
});

describe('CambiarTipoAsiento', () => {
  async function busConCroquis() {
    const repositorio = new CroquisEnMemoria();
    await new GenerarCroquis(repositorio).ejecutar(BUS.id, [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'semicama' }]);
    return { repositorio, cambiar: new CambiarTipoAsiento(repositorio) };
  }

  it('cambia el tipo de un asiento y devuelve el croquis actualizado', async () => {
    const { cambiar } = await busConCroquis();

    const croquis = await cambiar.ejecutar(BUS.id, 'a-2', 'cama');

    expect(croquis.asientos.map((a) => a.tipo)).toEqual(['semicama', 'cama', 'semicama', 'semicama']);
  });

  it('no deja un asiento sin precio en los viajes ya programados del bus', async () => {
    const { cambiar, repositorio } = await busConCroquis();
    repositorio.sinTarifa = 2;

    await expect(cambiar.ejecutar(BUS.id, 'a-1', 'cama')).rejects.toThrow(CroquisEnUsoError);
    expect(repositorio.asientos[0]?.tipo).toBe('semicama');
  });

  it('tipo fuera del catalogo -> 400; asiento o bus inexistente -> 404', async () => {
    const { cambiar } = await busConCroquis();

    await expect(cambiar.ejecutar(BUS.id, 'a-1', 'ejecutivo')).rejects.toThrow(AsientoInvalidoError);
    await expect(cambiar.ejecutar(BUS.id, 'a-99', 'cama')).rejects.toThrow(AsientoNoEncontradoError);
    await expect(cambiar.ejecutar('otro-bus', 'a-1', 'cama')).rejects.toThrow(BusNoEncontradoError);
  });
});
