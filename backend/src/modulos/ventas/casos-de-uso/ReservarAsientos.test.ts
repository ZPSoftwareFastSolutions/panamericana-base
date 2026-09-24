import { describe, expect, it } from 'vitest';
import { DocumentoInvalidoError } from '../../../compartido/dominio/erroresPersona';
import { TramoInvalidoError, ViajeNoDisponibleError } from '../../../compartido/dominio/erroresViaje';
import type { AsientoParaReservar, VentaNueva, ViajeParaReservar } from '../dominio/Venta';
import type { ResultadoPago, VentaDetalle, VentaRepositorio } from '../dominio/VentaRepositorio';
import {
  AsientoNoDisponibleError,
  ReservaExpiradaError,
  ReservaInvalidaError,
  VentaNoEncontradaError,
  VentaNoPendienteError,
} from '../dominio/errores';
import { PagarVenta } from './PagarVenta';
import { ReservarAsientos } from './ReservarAsientos';

const AHORA = new Date('2026-09-30T12:00:00Z');

const VIAJE: ViajeParaReservar = {
  id: 'viaje-1',
  ruta_id: 'ruta-1',
  bus_id: 'bus-1',
  estado: 'programado',
  fecha_salida: new Date('2026-10-01T12:00:00Z'),
  duracion_ruta: 420,
  paradas: [
    { orden: 1, minutos_desde_origen: 0, terminal: 'T. La Paz', ciudad: 'La Paz' },
    { orden: 2, minutos_desde_origen: 210, terminal: 'T. Oruro', ciudad: 'Oruro' },
    { orden: 3, minutos_desde_origen: 420, terminal: 'T. Cochabamba', ciudad: 'Cochabamba' },
  ],
  tarifas: [
    { tipo_asiento: 'semicama', precio: 95 },
    { tipo_asiento: 'cama', precio: 120 },
  ],
};

const ASIENTOS: AsientoParaReservar[] = [
  { id: 'a1', numero: 1, tipo: 'cama', ocupado: false },
  { id: 'a2', numero: 2, tipo: 'semicama', ocupado: false },
  { id: 'a3', numero: 3, tipo: 'semicama', ocupado: true },
];

/** repositorio falso: guarda en memoria y arma el detalle como lo haria la base */
class VentasEnMemoria implements VentaRepositorio {
  guardadas: VentaNueva[] = [];
  estados = new Map<string, string>();
  expiradas: string[] = [];
  resultadoPago: ResultadoPago = 'pagada';

  async contextoDeReserva(viaje_id: string) {
    return viaje_id === VIAJE.id ? { viaje: VIAJE, asientos: ASIENTOS } : null;
  }
  async guardarReserva(venta: VentaNueva) {
    this.guardadas.push(venta);
    this.estados.set(venta.id, 'pendiente');
  }
  async buscarPorCodigo(codigo: string): Promise<VentaDetalle | null> {
    const venta = this.guardadas.find((v) => v.codigo === codigo);
    if (!venta) return null;
    const estado = this.estados.get(venta.id)!;
    return {
      id: venta.id,
      codigo: venta.codigo,
      canal: venta.canal,
      estado,
      total: venta.pasajes.reduce((suma, p) => suma + p.precio, 0),
      reservado_hasta: estado === 'pendiente' ? venta.reservado_hasta.toISOString() : null,
      creado_en: AHORA.toISOString(),
      viaje: null,
      pasajes: venta.pasajes.map((p) => ({
        codigo: p.codigo,
        estado: estado === 'pagada' ? 'pagado' : 'reservado',
        precio: p.precio,
        asiento: { numero: ASIENTOS.find((a) => a.id === p.asiento_id)!.numero, piso: 1, tipo: 'cama' },
        pasajero: { ...p.pasajero },
      })),
    };
  }
  async expirar(venta_id: string) {
    this.expiradas.push(venta_id);
    this.estados.set(venta_id, 'expirada');
  }
  async registrarPago(venta_id: string) {
    if (this.resultadoPago === 'pagada') this.estados.set(venta_id, 'pagada');
    return this.resultadoPago;
  }
}

const pasajero = (asiento_id: string, numero_documento: string) => ({
  asiento_id,
  tipo_documento: 'ci',
  numero_documento,
  nombres: 'Maria',
  apellidos: 'Flores',
});

const entrada = {
  viaje_id: VIAJE.id,
  orden_origen: 2,
  orden_destino: 3,
  pasajeros: [pasajero('a1', '4827351'), pasajero('a2', '6093184')],
};

function crear(ahora = AHORA) {
  const repositorio = new VentasEnMemoria();
  return {
    repositorio,
    reservar: new ReservarAsientos(repositorio, 10, () => ahora),
    pagar: (momento = ahora) => new PagarVenta(repositorio, () => momento),
  };
}

describe('ReservarAsientos', () => {
  it('crea la venta pendiente con el precio del tramo y retiene los asientos 10 minutos', async () => {
    const { reservar, repositorio } = crear();

    const venta = await reservar.ejecutar(entrada);

    expect(venta.estado).toBe('pendiente');
    expect(venta.codigo).toMatch(/^V-[A-Z2-9]{8}$/);
    // tramo Oruro -> Cochabamba = mitad de la ruta: cama 120 -> 60 · semicama 95 -> 47.50
    expect(venta.pasajes.map((p) => p.precio)).toEqual([60, 47.5]);
    expect(venta.total).toBe(107.5);
    expect(venta.reservado_hasta).toBe('2026-09-30T12:10:00.000Z');
    expect(repositorio.guardadas[0]!.pasajes[0]!.codigo).toMatch(/^P-/);
  });

  it('en paginas publicas oculta el documento del pasajero', async () => {
    const venta = await crear().reservar.ejecutar(entrada);
    expect(venta.pasajes[0]!.pasajero.numero_documento).toBe('****351');
  });

  it('responde 409 si el asiento ya esta ocupado en ese tramo', async () => {
    await expect(
      crear().reservar.ejecutar({ ...entrada, pasajeros: [pasajero('a3', '4827351')] }),
    ).rejects.toThrow(AsientoNoDisponibleError);
  });

  it('rechaza asientos de otro bus, asientos repetidos y la misma persona dos veces', async () => {
    const { reservar } = crear();
    await expect(reservar.ejecutar({ ...entrada, pasajeros: [pasajero('otro', '4827351')] })).rejects.toThrow(
      ReservaInvalidaError,
    );
    await expect(
      reservar.ejecutar({ ...entrada, pasajeros: [pasajero('a1', '4827351'), pasajero('a1', '6093184')] }),
    ).rejects.toThrow(ReservaInvalidaError);
    await expect(
      reservar.ejecutar({ ...entrada, pasajeros: [pasajero('a1', '4827351'), pasajero('a2', '4827351')] }),
    ).rejects.toThrow(ReservaInvalidaError);
  });

  it('acepta de 1 a 5 pasajeros por compra', async () => {
    const seis = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map((id, i) => pasajero(id, `482735${i}`));
    await expect(crear().reservar.ejecutar({ ...entrada, pasajeros: seis })).rejects.toThrow(ReservaInvalidaError);
    await expect(crear().reservar.ejecutar({ ...entrada, pasajeros: [] })).rejects.toThrow(ReservaInvalidaError);
  });

  it('valida el tramo, el documento boliviano y que el bus no haya pasado por la parada', async () => {
    const { reservar } = crear();
    await expect(reservar.ejecutar({ ...entrada, orden_origen: 3, orden_destino: 2 })).rejects.toThrow(
      TramoInvalidoError,
    );
    await expect(reservar.ejecutar({ ...entrada, pasajeros: [pasajero('a1', 'ABC')] })).rejects.toThrow(
      DocumentoInvalidoError,
    );

    // el 1 de octubre a las 16:00 UTC el bus ya paso por Oruro (15:30 UTC)
    const tarde = crear(new Date('2026-10-01T16:00:00Z'));
    await expect(tarde.reservar.ejecutar(entrada)).rejects.toThrow(ViajeNoDisponibleError);
  });
});

describe('PagarVenta', () => {
  it('cobra la venta pendiente y los pasajes quedan pagados', async () => {
    const { reservar, pagar } = crear();
    const reservada = await reservar.ejecutar(entrada);

    const pagada = await pagar().ejecutar(reservada.codigo);

    expect(pagada.estado).toBe('pagada');
    expect(pagada.pasajes.every((p) => p.estado === 'pagado')).toBe(true);
  });

  it('si la reserva vencio, libera los asientos y responde "reserva expirada"', async () => {
    const { reservar, pagar, repositorio } = crear();
    const reservada = await reservar.ejecutar(entrada);

    await expect(pagar(new Date('2026-09-30T12:11:00Z')).ejecutar(reservada.codigo)).rejects.toThrow(
      ReservaExpiradaError,
    );
    expect(repositorio.expiradas).toHaveLength(1);
  });

  it('una venta que ya quedo expirada responde "reserva expirada" (no "ya pagada")', async () => {
    const { reservar, pagar, repositorio } = crear();
    const reservada = await reservar.ejecutar(entrada);
    await repositorio.expirar(reservada.id);

    await expect(pagar().ejecutar(reservada.codigo)).rejects.toThrow(ReservaExpiradaError);
  });

  it('si vence justo durante el pago tambien responde "reserva expirada"', async () => {
    const { reservar, pagar, repositorio } = crear();
    const reservada = await reservar.ejecutar(entrada);
    repositorio.resultadoPago = 'expirada';

    await expect(pagar().ejecutar(reservada.codigo)).rejects.toThrow(ReservaExpiradaError);
  });

  it('no cobra dos veces ni una venta que no existe', async () => {
    const { reservar, pagar } = crear();
    const reservada = await reservar.ejecutar(entrada);
    await pagar().ejecutar(reservada.codigo);

    await expect(pagar().ejecutar(reservada.codigo)).rejects.toThrow(VentaNoPendienteError);
    await expect(pagar().ejecutar('V-NOEXISTE')).rejects.toThrow(VentaNoEncontradaError);
  });
});
