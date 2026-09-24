import { describe, expect, it } from 'vitest';
import { exigirTramoALaVenta, horaDePaso, precioDeTramo, resolverTramo } from './Tramo';
import { TramoInvalidoError, ViajeNoDisponibleError } from './erroresViaje';

const PARADAS = [
  { orden: 1, minutos_desde_origen: 0, terminal: 'Terminal La Paz', ciudad: 'La Paz' },
  { orden: 2, minutos_desde_origen: 210, terminal: 'Terminal Oruro', ciudad: 'Oruro' },
  { orden: 3, minutos_desde_origen: 420, terminal: 'Terminal Cochabamba', ciudad: 'Cochabamba' },
];

describe('precioDeTramo', () => {
  it('cobra la parte proporcional al tiempo del tramo', () => {
    expect(precioDeTramo(80, 210, 420)).toBe(40);
    expect(precioDeTramo(95, 210, 420)).toBe(47.5);
  });

  it('redondea a Bs 0,50', () => {
    // 100 × 100 / 420 = 23.81 -> 24.00 · 100 × 130 / 420 = 30.95 -> 31.00 · 100 × 115 / 420 = 27.38 -> 27.50
    expect(precioDeTramo(100, 100, 420)).toBe(24);
    expect(precioDeTramo(100, 130, 420)).toBe(31);
    expect(precioDeTramo(100, 115, 420)).toBe(27.5);
  });

  it('el recorrido completo cuesta exactamente la tarifa', () => {
    expect(precioDeTramo(120, 420, 420)).toBe(120);
  });

  it('nunca cobra menos de Bs 0,50', () => {
    expect(precioDeTramo(5, 1, 420)).toBe(0.5);
  });
});

describe('resolverTramo', () => {
  it('devuelve las paradas del tramo y cuanto dura', () => {
    const tramo = resolverTramo(PARADAS, 2, 3);
    expect(tramo.origen.ciudad).toBe('Oruro');
    expect(tramo.minutos).toBe(210);
  });

  it('rechaza un tramo al reves o con paradas que no existen', () => {
    expect(() => resolverTramo(PARADAS, 3, 1)).toThrow(TramoInvalidoError);
    expect(() => resolverTramo(PARADAS, 2, 2)).toThrow(TramoInvalidoError);
    expect(() => resolverTramo(PARADAS, 1, 7)).toThrow(TramoInvalidoError);
  });
});

describe('exigirTramoALaVenta', () => {
  const salida = new Date('2026-10-01T12:00:00Z');

  it('permite vender mientras el bus no pasa por la parada de subida', () => {
    const ahora = new Date('2026-10-01T13:00:00Z'); // el bus salio, pero llega a Oruro a las 15:30
    expect(() => exigirTramoALaVenta('programado', salida, PARADAS[1]!, ahora)).not.toThrow();
    expect(horaDePaso(salida, 210).toISOString()).toBe('2026-10-01T15:30:00.000Z');
  });

  it('no vende si el bus ya paso o si el viaje no esta programado', () => {
    const ahora = new Date('2026-10-01T13:00:00Z');
    expect(() => exigirTramoALaVenta('programado', salida, PARADAS[0]!, ahora)).toThrow(
      ViajeNoDisponibleError,
    );
    expect(() => exigirTramoALaVenta('cancelado', salida, PARADAS[1]!, ahora)).toThrow(
      ViajeNoDisponibleError,
    );
  });
});
