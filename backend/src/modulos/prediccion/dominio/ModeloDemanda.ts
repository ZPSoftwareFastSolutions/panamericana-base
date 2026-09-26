import { caracteristicasDelDia, NOMBRES_CARACTERISTICAS } from './Caracteristicas';
import { ModeloInvalidoError } from './errores';

/**
 * MODELO DE DEMANDA: regresion lineal multiple entrenada fuera de la API (npm run ml:entrenar)
 * y guardada como coeficientes en un JSON. La API solo MULTIPLICA y SUMA: no entrena.
 *
 * El modelo estima un INDICE de demanda del dia (1 = un dia normal de la ruta).
 * Pasajes estimados = demanda base de la ruta × indice.
 */
export type ModeloDemanda = {
  tipo: string;
  version: string;
  entrenado_en: string;
  datos: string;
  inicio_serie: string;
  caracteristicas: string[];
  coeficientes: number[];
  metricas: { mae: number; rmse: number; r2: number; n_entrenamiento: number; n_prueba: number };
  /** pasajes por dia de cada ruta en los datos de entrenamiento (por nombre de ruta) */
  base_por_ruta: Record<string, number>;
  base_por_defecto: number;
};

/** si la ocupacion estimada supera este valor, conviene programar un bus de refuerzo */
export const UMBRAL_REFUERZO = 0.9;

/** el JSON debe corresponder a las caracteristicas que calcula el dominio hoy */
export function exigirModeloCompatible(modelo: ModeloDemanda): void {
  const esperado = NOMBRES_CARACTERISTICAS.join(',');
  if (modelo.caracteristicas.join(',') !== esperado || modelo.coeficientes.length !== NOMBRES_CARACTERISTICAS.length) {
    throw new ModeloInvalidoError('las características del modelo no coinciden: vuelve a entrenarlo');
  }
}

export function indiceDelDia(modelo: ModeloDemanda, fecha: string): number {
  const x = caracteristicasDelDia(fecha, modelo.inicio_serie);
  return x.reduce((suma, valor, i) => suma + valor * modelo.coeficientes[i]!, 0);
}

/** pasajes estimados de una ruta en un dia (entero, nunca negativo) */
export function pasajesEstimados(modelo: ModeloDemanda, base: number, fecha: string): number {
  return Math.max(0, Math.round(base * indiceDelDia(modelo, fecha)));
}

/** base de la ruta: sus ventas reales si hay suficientes dias, si no la del modelo */
export function baseDeRuta(
  modelo: ModeloDemanda,
  ruta: { nombre: string },
  historial: { dias_con_ventas: number; promedio: number } | undefined,
  diasMinimos: number,
): { pasajes_por_dia: number; fuente: 'ventas_reales' | 'modelo' } {
  if (historial && historial.dias_con_ventas >= diasMinimos && historial.promedio > 0) {
    return { pasajes_por_dia: Math.round(historial.promedio * 10) / 10, fuente: 'ventas_reales' };
  }
  return { pasajes_por_dia: modelo.base_por_ruta[ruta.nombre] ?? modelo.base_por_defecto, fuente: 'modelo' };
}

/** alerta del dia segun la capacidad ya programada */
export function evaluarCapacidad(
  estimados: number,
  capacidad: number,
): { ocupacion_estimada: number | null; alerta: 'refuerzo_sugerido' | 'sin_viajes' | null } {
  if (capacidad <= 0) return { ocupacion_estimada: null, alerta: estimados > 0 ? 'sin_viajes' : null };
  const ocupacion = Math.round((estimados / capacidad) * 1000) / 1000;
  return { ocupacion_estimada: ocupacion, alerta: ocupacion > UMBRAL_REFUERZO ? 'refuerzo_sugerido' : null };
}
