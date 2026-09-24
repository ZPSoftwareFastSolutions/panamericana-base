import { describe, expect, it } from 'vitest';
import type { PasajeDetalle, PasajeRepositorio } from '../dominio/PasajeRepositorio';
import type { VentaDetalle } from '../dominio/VentaRepositorio';
import { AnulacionFueraDePlazoError, PasajeNoAnulableError, PasajeNoEncontradoError } from '../dominio/errores';
import { AnularPasaje } from './AnularPasaje';
import { ObtenerPasaje } from './ObtenerPasaje';
import type { PagarVenta } from './PagarVenta';
import type { ReservarAsientos } from './ReservarAsientos';
import { VenderEnTaquilla } from './VenderEnTaquilla';

// el pasajero sube en Oruro el 01/10 a las 15:30 UTC (11:30 en La Paz)
const SUBIDA = '2026-10-01T15:30:00.000Z';

const PASAJE: PasajeDetalle = {
  codigo: 'P-ABCD2345',
  estado: 'pagado',
  precio: 47.5,
  venta: { codigo: 'V-ABCD2345', canal: 'web' },
  asiento: { numero: 12, piso: 1, tipo: 'semicama' },
  pasajero: { tipo_documento: 'ci', numero_documento: '4827351', nombres: 'Maria', apellidos: 'Flores' },
  viaje: {
    id: 'viaje-1',
    ruta: { id: 'ruta-1', nombre: 'La Paz - Cochabamba' },
    bus: { id: 'bus-1', placa: '3187HTR' },
    fecha_salida: '2026-10-01T12:00:00.000Z',
    origen: { orden: 2, terminal: 'T. Oruro', ciudad: 'Oruro', hora: SUBIDA },
    destino: { orden: 3, terminal: 'T. Cochabamba', ciudad: 'Cochabamba', hora: '2026-10-01T19:00:00.000Z' },
  },
};

class PasajesEnMemoria implements PasajeRepositorio {
  pasaje: PasajeDetalle = { ...PASAJE };
  anulaciones: string[] = [];
  /** simula que otra persona lo anulo justo antes */
  yaAnulado = false;

  async buscarPorCodigo(codigo: string) {
    return codigo === this.pasaje.codigo ? this.pasaje : null;
  }
  async anular(codigo: string, referencia: string) {
    if (this.yaAnulado) return false;
    this.anulaciones.push(referencia);
    this.pasaje = { ...this.pasaje, estado: 'anulado' };
    return true;
  }
}

const en = (iso: string) => () => new Date(iso);

describe('ObtenerPasaje', () => {
  it('el boleto oculta el documento y trae la hora limite para anular (2 h antes de subir)', async () => {
    const boleto = await new ObtenerPasaje(new PasajesEnMemoria()).ejecutar(' p-abcd2345 ');

    expect(boleto.pasajero.numero_documento).toBe('****351');
    expect(boleto.anulable_hasta).toBe('2026-10-01T13:30:00.000Z');
  });

  it('codigo inexistente -> 404', async () => {
    await expect(new ObtenerPasaje(new PasajesEnMemoria()).ejecutar('P-NOEXISTE')).rejects.toThrow(
      PasajeNoEncontradoError,
    );
  });
});

describe('AnularPasaje', () => {
  it('anula un pasaje pagado a tiempo y devuelve el precio completo', async () => {
    const repositorio = new PasajesEnMemoria();

    const resultado = await new AnularPasaje(repositorio, en('2026-10-01T13:29:00Z')).ejecutar('P-ABCD2345');

    expect(resultado.reembolso).toBe(47.5);
    expect(resultado.pasaje.estado).toBe('anulado');
    expect(repositorio.anulaciones).toEqual(['REEMBOLSO-P-ABCD2345']);
  });

  it('pasado el limite de 2 horas antes de subir -> anulacion_fuera_de_plazo', async () => {
    const anular = new AnularPasaje(new PasajesEnMemoria(), en('2026-10-01T13:31:00Z'));

    await expect(anular.ejecutar('P-ABCD2345')).rejects.toThrow(AnulacionFueraDePlazoError);
  });

  it('una reserva sin pagar o un pasaje ya anulado no se anulan', async () => {
    const repositorio = new PasajesEnMemoria();
    repositorio.pasaje = { ...PASAJE, estado: 'reservado' };
    const anular = new AnularPasaje(repositorio, en('2026-09-30T12:00:00Z'));

    await expect(anular.ejecutar('P-ABCD2345')).rejects.toThrow(PasajeNoAnulableError);
    repositorio.pasaje = { ...PASAJE, estado: 'anulado' };
    await expect(anular.ejecutar('P-ABCD2345')).rejects.toThrow(PasajeNoAnulableError);
  });

  it('si otra persona lo anulo un instante antes, responde 409 sin reembolsar dos veces', async () => {
    const repositorio = new PasajesEnMemoria();
    repositorio.yaAnulado = true;

    await expect(
      new AnularPasaje(repositorio, en('2026-09-30T12:00:00Z')).ejecutar('P-ABCD2345'),
    ).rejects.toThrow(PasajeNoAnulableError);
    expect(repositorio.anulaciones).toEqual([]);
  });
});

describe('VenderEnTaquilla', () => {
  it('reutiliza la reserva y el pago: canal taquilla, vendedor registrado y pago en efectivo', async () => {
    const llamadas: unknown[] = [];
    const reservar = {
      ejecutar: async (_entrada: unknown, opciones: unknown) => {
        llamadas.push(['reservar', opciones]);
        return { id: 'venta-1', codigo: 'V-TAQUILLA' } as VentaDetalle;
      },
    } as unknown as ReservarAsientos;
    const pagar = {
      ejecutar: async (codigo: string, opciones: unknown) => {
        llamadas.push(['pagar', codigo, opciones]);
        return { codigo, estado: 'pagada' } as VentaDetalle;
      },
    } as unknown as PagarVenta;

    const venta = await new VenderEnTaquilla(reservar, pagar, { expirar: async () => {} }).ejecutar(
      { viaje_id: 'viaje-1', orden_origen: 1, orden_destino: 2, pasajeros: [] },
      'vendedor-1',
    );

    expect(venta.estado).toBe('pagada');
    expect(llamadas).toEqual([
      ['reservar', { canal: 'taquilla', usuario_id: 'vendedor-1', mostrarDocumentos: true }],
      ['pagar', 'V-TAQUILLA', { metodo: 'efectivo', mostrarDocumentos: true }],
    ]);
  });

  it('si el cobro falla, libera la reserva recien hecha y devuelve el error', async () => {
    const liberadas: string[] = [];
    const reservar = {
      ejecutar: async () => ({ id: 'venta-2', codigo: 'V-FALLA' }) as VentaDetalle,
    } as unknown as ReservarAsientos;
    const pagar = {
      ejecutar: async () => {
        throw new Error('se corto la conexion');
      },
    } as unknown as PagarVenta;
    const vender = new VenderEnTaquilla(reservar, pagar, { expirar: async (id: string) => void liberadas.push(id) });

    await expect(
      vender.ejecutar({ viaje_id: 'viaje-1', orden_origen: 1, orden_destino: 2, pasajeros: [] }, 'vendedor-1'),
    ).rejects.toThrow('se corto la conexion');
    expect(liberadas).toEqual(['venta-2']);
  });
});
