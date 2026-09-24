import type { PanelRepositorio } from '../dominio/PanelRepositorio';
import { porcentaje, resolverPeriodo } from '../dominio/Periodo';

export type EntradaIndicadores = { desde?: string; hasta?: string; ruta_id?: string };

const redondear = (monto: number) => Math.round(monto * 100) / 100;

/**
 * Caso de uso: indicadores del panel (ventas, ingresos, ocupacion y encomiendas).
 * Las consultas son independientes, asi que se piden a la base al mismo tiempo.
 */
export class ObtenerIndicadores {
  constructor(
    private readonly panel: PanelRepositorio,
    private readonly hoy: () => string,
  ) {}

  async ejecutar(entrada: EntradaIndicadores) {
    const filtro = { ...resolverPeriodo(entrada, this.hoy()), ruta_id: entrada.ruta_id ?? null };
    const [pasajes, dinero, canales, viajes, encomiendas] = await Promise.all([
      this.panel.pasajes(filtro),
      this.panel.dinero(filtro),
      this.panel.ventasPorCanal(filtro),
      this.panel.ocupacion(filtro),
      this.panel.encomiendas(filtro),
    ]);

    const ocupacion = viajes.map((v) => ({ ...v, porcentaje: porcentaje(v.vendidos, v.total) }));
    const cantidad = (estado: string) => encomiendas.find((e) => e.estado === estado)?.cantidad ?? 0;

    return {
      ...filtro,
      pasajes,
      ingresos: {
        cobrado: redondear(dinero.cobrado),
        reembolsado: redondear(dinero.reembolsado),
        neto: redondear(dinero.cobrado - dinero.reembolsado),
      },
      ventas_por_canal: canales.map((c) => ({ ...c, monto: redondear(c.monto) })),
      ocupacion,
      // promedio ponderado: asientos vendidos sobre asientos ofrecidos
      ocupacion_promedio:
        ocupacion.length > 0
          ? porcentaje(
              ocupacion.reduce((s, v) => s + v.vendidos, 0),
              ocupacion.reduce((s, v) => s + v.total, 0),
            )
          : null,
      encomiendas: {
        registradas: encomiendas.reduce((s, e) => s + e.cantidad, 0),
        en_camino: cantidad('registrada') + cantidad('en_transito') + cantidad('en_destino'),
        entregadas: cantidad('entregada'),
        canceladas: cantidad('cancelada'),
        ingresos: redondear(encomiendas.filter((e) => e.estado !== 'cancelada').reduce((s, e) => s + e.ingresos, 0)),
      },
    };
  }
}
