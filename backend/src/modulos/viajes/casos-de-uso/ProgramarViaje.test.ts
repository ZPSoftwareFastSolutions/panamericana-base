import { describe, expect, it } from 'vitest';
import type { NuevoViaje } from '../dominio/Programacion';
import type { ViajeRepositorio, ViajeResumen } from '../dominio/ViajeRepositorio';
import { BusOcupadoError, ViajeInvalidoError } from '../dominio/errores';
import { BuscarViajes } from './BuscarViajes';
import { ProgramarViaje } from './ProgramarViaje';

const AHORA = new Date('2026-09-23T12:00:00Z');
const RUTA = { id: 'ruta-1', nombre: 'La Paz - Cochabamba', activo: true, duracion_min: 420 };
const BUS = { id: 'bus-1', placa: '2045KLP', estado: 'activo', tipos_asiento: ['semicama', 'cama'] };

/** repositorio falso: solo lo que usan estos casos de uso */
class ViajesEnMemoria implements Partial<ViajeRepositorio> {
  guardados: NuevoViaje[] = [];
  bus = BUS;

  async datosParaProgramar() {
    return { ruta: RUTA, bus: this.bus };
  }
  async busOcupado(bus_id: string, salida: Date, llegada: Date) {
    return this.guardados.some(
      (v) => v.bus_id === bus_id && v.fecha_salida < llegada && salida < v.fecha_llegada_estimada,
    );
  }
  async guardar(viaje: NuevoViaje) {
    this.guardados.push(viaje);
  }
  async buscarPorId(id: string): Promise<ViajeResumen | null> {
    const v = this.guardados.find((g) => g.id === id);
    if (!v) return null;
    return {
      id: v.id,
      fecha_salida: v.fecha_salida.toISOString(),
      fecha_llegada_estimada: v.fecha_llegada_estimada.toISOString(),
      estado: 'programado',
      ruta: { id: RUTA.id, nombre: RUTA.nombre },
      bus: { id: BUS.id, placa: BUS.placa },
      tarifas: v.tarifas,
      total_asientos: 40,
      asientos_vendidos: 0,
    };
  }
}

function crear(repositorio = new ViajesEnMemoria()) {
  return {
    repositorio,
    programar: new ProgramarViaje(repositorio as unknown as ViajeRepositorio, () => AHORA),
  };
}

const entrada = {
  ruta_id: RUTA.id,
  bus_id: BUS.id,
  fecha_salida: '2026-10-01T08:00:00-04:00',
  tarifas: [
    { tipo_asiento: 'semicama', precio: 95 },
    { tipo_asiento: 'cama', precio: 120 },
  ],
};

describe('ProgramarViaje', () => {
  it('calcula la llegada con la duracion de la ruta y guarda las tarifas', async () => {
    const { programar } = crear();

    const viaje = await programar.ejecutar(entrada);

    expect(viaje.fecha_salida).toBe('2026-10-01T12:00:00.000Z');
    expect(viaje.fecha_llegada_estimada).toBe('2026-10-01T19:00:00.000Z');
    expect(viaje.tarifas).toHaveLength(2);
  });

  it('exige una tarifa por cada tipo de asiento del bus, y solo de esos tipos', async () => {
    const { programar } = crear();

    await expect(
      programar.ejecutar({ ...entrada, tarifas: [{ tipo_asiento: 'semicama', precio: 95 }] }),
    ).rejects.toThrow(ViajeInvalidoError);
    await expect(
      programar.ejecutar({ ...entrada, tarifas: [...entrada.tarifas, { tipo_asiento: 'normal', precio: 80 }] }),
    ).rejects.toThrow(ViajeInvalidoError);
  });

  it('rechaza precios en cero, negativos o con mas de 2 decimales', async () => {
    const { programar } = crear();
    for (const precio of [0, -10, 95.555]) {
      await expect(
        programar.ejecutar({ ...entrada, tarifas: [{ tipo_asiento: 'semicama', precio }, entrada.tarifas[1]!] }),
      ).rejects.toThrow(ViajeInvalidoError);
    }
  });

  it('no programa en el pasado ni con un bus en mantenimiento', async () => {
    const { programar, repositorio } = crear();
    await expect(programar.ejecutar({ ...entrada, fecha_salida: '2026-09-01T08:00:00-04:00' })).rejects.toThrow(
      ViajeInvalidoError,
    );

    repositorio.bus = { ...BUS, estado: 'mantenimiento' };
    await expect(programar.ejecutar(entrada)).rejects.toThrow(ViajeInvalidoError);
  });

  it('un bus no puede tener dos viajes con horarios cruzados', async () => {
    const { programar } = crear();
    await programar.ejecutar(entrada);

    // sale 3 horas despues, cuando el primer viaje todavia no llego
    await expect(programar.ejecutar({ ...entrada, fecha_salida: '2026-10-01T11:00:00-04:00' })).rejects.toThrow(
      BusOcupadoError,
    );
    // sale cuando el primero ya llego: si se puede
    await expect(programar.ejecutar({ ...entrada, fecha_salida: '2026-10-01T16:00:00-04:00' })).resolves.toBeDefined();
  });
});

describe('BuscarViajes', () => {
  const candidato = {
    viaje_id: 'v-1',
    ruta: { id: 'r1', nombre: 'La Paz - Cochabamba' },
    bus: { id: 'b1', placa: '2045KLP' },
    fecha_salida: new Date('2026-10-01T12:00:00Z'),
    duracion_ruta: 420,
    origen: { orden: 2, minutos_desde_origen: 210, terminal: 'Terminal Oruro', ciudad: 'Oruro' },
    destino: { orden: 3, minutos_desde_origen: 420, terminal: 'Terminal Cochabamba', ciudad: 'Cochabamba' },
    tarifas: [
      { tipo_asiento: 'cama', precio: 120 },
      { tipo_asiento: 'semicama', precio: 95 },
    ],
    asientos_libres: 12,
  };

  const repositorio = { buscarCandidatos: async () => [candidato] } as unknown as ViajeRepositorio;

  it('devuelve el tramo con su hora de paso y el precio proporcional de cada tipo', async () => {
    const [resultado] = await new BuscarViajes(repositorio).ejecutar({
      origen: 'oruro',
      destino: 'cochabamba',
      fecha: '2026-10-01',
    });

    expect(resultado!.origen.hora).toBe('2026-10-01T15:30:00.000Z');
    expect(resultado!.duracion_min).toBe(210);
    expect(resultado!.tarifas_tramo).toEqual([
      { tipo_asiento: 'semicama', precio: 47.5 },
      { tipo_asiento: 'cama', precio: 60 },
    ]);
    expect(resultado!.precio_desde).toBe(47.5);
  });

  it('rechaza origen igual al destino y fechas sin formato', async () => {
    const buscar = new BuscarViajes(repositorio);
    await expect(buscar.ejecutar({ origen: 'x', destino: 'x', fecha: '2026-10-01' })).rejects.toThrow();
    await expect(buscar.ejecutar({ origen: 'x', destino: 'y', fecha: '01/10/2026' })).rejects.toThrow();
  });
});
