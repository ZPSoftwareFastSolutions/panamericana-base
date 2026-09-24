/** un periodo ya validado y, si se eligio, una ruta */
export type Filtro = { desde: string; hasta: string; ruta_id: string | null };

export type OcupacionDeViaje = {
  viaje_id: string;
  fecha_salida: string;
  ruta: string;
  bus: string;
  vendidos: number;
  total: number;
};

/** lo que el panel necesita leer de la base (solo consultas) */
export interface PanelRepositorio {
  /** pasajes de las ventas hechas en el periodo */
  pasajes(filtro: Filtro): Promise<{ vendidos: number; anulados: number }>;
  /** pagos aprobados y reembolsos registrados en el periodo */
  dinero(filtro: Filtro): Promise<{ cobrado: number; reembolsado: number }>;
  ventasPorCanal(filtro: Filtro): Promise<{ canal: string; ventas: number; monto: number }[]>;
  /** viajes que salen en el periodo (sin los cancelados) */
  ocupacion(filtro: Filtro): Promise<OcupacionDeViaje[]>;
  /** encomiendas registradas en el periodo, por su estado actual (sin filtro de ruta) */
  encomiendas(filtro: Filtro): Promise<{ estado: string; cantidad: number; ingresos: number }[]>;
}
