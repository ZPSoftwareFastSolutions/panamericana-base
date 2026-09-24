import type { CanalVenta } from './venta';

/** filtros del panel: fechas en hora de La Paz (AAAA-MM-DD) y, si se quiere, una ruta */
export type FiltroIndicadores = {
  desde?: string;
  hasta?: string;
  ruta_id?: string;
};

/** indicadores del panel de la administradora (HU-029) */
export type Indicadores = {
  desde: string;
  hasta: string;
  ruta_id: string | null;
  /** pasajes pagados y anulados de las ventas hechas en el rango */
  pasajes: { vendidos: number; anulados: number };
  /** dinero del rango: lo cobrado menos lo devuelto */
  ingresos: { cobrado: number; reembolsado: number; neto: number };
  ventas_por_canal: { canal: CanalVenta; ventas: number; monto: number }[];
  /** ocupacion de los viajes que salen en el rango */
  ocupacion: {
    viaje_id: string;
    fecha_salida: string;
    ruta: string;
    bus: string;
    vendidos: number;
    total: number;
    porcentaje: number;
  }[];
  ocupacion_promedio: number | null;
  /** encomiendas registradas en el rango (sin filtro de ruta: van de terminal a terminal) */
  encomiendas: { registradas: number; en_camino: number; entregadas: number; canceladas: number; ingresos: number };
};

export type AlertaDemanda = 'refuerzo_sugerido' | 'sin_viajes';

/** demanda estimada de una ruta en un dia */
export type DemandaDelDia = {
  fecha: string;
  ruta: { id: string; nombre: string };
  feriado: boolean;
  pasajes_estimados: number;
  capacidad_programada: number;
  viajes_programados: number;
  /** estimados / capacidad (null si no hay viajes programados) */
  ocupacion_estimada: number | null;
  alerta: AlertaDemanda | null;
};

/** prediccion de demanda de los proximos dias (HU-033) */
export type PrediccionDemanda = {
  modelo: {
    tipo: string;
    version: string;
    entrenado_en: string;
    /** los datos de entrenamiento del MVP son sinteticos y se declara asi */
    datos: string;
    metricas: { mae: number; rmse: number; r2: number; n_entrenamiento: number; n_prueba: number };
  };
  /** demanda base de cada ruta: de las ventas reales si hay suficientes, si no del modelo */
  bases: { ruta: { id: string; nombre: string }; pasajes_por_dia: number; fuente: 'ventas_reales' | 'modelo' }[];
  dias: DemandaDelDia[];
};
