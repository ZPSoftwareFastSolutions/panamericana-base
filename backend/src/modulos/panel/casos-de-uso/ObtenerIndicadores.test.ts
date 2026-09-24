import { describe, expect, it } from 'vitest';
import type { Filtro, PanelRepositorio } from '../dominio/PanelRepositorio';
import { PeriodoDelPanelInvalidoError } from '../dominio/errores';
import { ObtenerIndicadores } from './ObtenerIndicadores';

class PanelEnMemoria implements PanelRepositorio {
  filtros: Filtro[] = [];
  async pasajes(filtro: Filtro) {
    this.filtros.push(filtro);
    return { vendidos: 7, anulados: 1 };
  }
  async dinero() {
    return { cobrado: 400.5, reembolsado: 47.5 };
  }
  async ventasPorCanal() {
    return [{ canal: 'web', ventas: 3, monto: 250.456 }];
  }
  async ocupacion() {
    return [
      { viaje_id: 'v1', fecha_salida: '2026-09-20T12:00:00.000Z', ruta: 'R', bus: 'B', vendidos: 30, total: 40 },
      { viaje_id: 'v2', fecha_salida: '2026-09-21T12:00:00.000Z', ruta: 'R', bus: 'B', vendidos: 10, total: 40 },
    ];
  }
  async encomiendas() {
    return [
      { estado: 'registrada', cantidad: 2, ingresos: 50 },
      { estado: 'entregada', cantidad: 1, ingresos: 30 },
      { estado: 'cancelada', cantidad: 1, ingresos: 25 },
    ];
  }
}

const crear = () => {
  const repositorio = new PanelEnMemoria();
  return { repositorio, obtener: new ObtenerIndicadores(repositorio, () => '2026-09-24') };
};

describe('ObtenerIndicadores', () => {
  it('por defecto mira los ultimos 30 dias y calcula neto, ocupacion ponderada y encomiendas', async () => {
    const { obtener, repositorio } = crear();

    const r = await obtener.ejecutar({});

    expect(repositorio.filtros[0]).toEqual({ desde: '2026-08-26', hasta: '2026-09-24', ruta_id: null });
    expect(r.ingresos).toEqual({ cobrado: 400.5, reembolsado: 47.5, neto: 353 });
    expect(r.ventas_por_canal[0]?.monto).toBe(250.46);
    expect(r.ocupacion.map((v) => v.porcentaje)).toEqual([75, 25]);
    expect(r.ocupacion_promedio).toBe(50);
    expect(r.encomiendas).toEqual({ registradas: 4, en_camino: 2, entregadas: 1, canceladas: 1, ingresos: 80 });
  });

  it('valida el periodo', async () => {
    const { obtener } = crear();

    await expect(obtener.ejecutar({ desde: '2026-02-30' })).rejects.toThrow(PeriodoDelPanelInvalidoError);
    await expect(obtener.ejecutar({ desde: '2026-09-25', hasta: '2026-09-24' })).rejects.toThrow('posterior');
    await expect(obtener.ejecutar({ desde: '2024-01-01', hasta: '2026-09-24' })).rejects.toThrow('366');
  });
});
