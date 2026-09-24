import { diasEntre } from '../../../compartido/dominio/Fechas';
import { esFeriado, esVisperaDeFeriado } from './FeriadosBolivia';

/**
 * CARACTERISTICAS DE UN DIA: los numeros con que el modelo describe una fecha.
 *
 * Se usan IGUAL al entrenar y al predecir (por eso viven en el dominio): si cambian aqui,
 * hay que volver a entrenar (npm run ml:entrenar).
 *
 *   intercepto · lunes..sabado (el domingo es la referencia) · feriado · vispera de feriado
 *   temporada alta (julio: vacaciones de invierno; diciembre: fin de año) · tendencia (años desde el inicio)
 */
export const NOMBRES_CARACTERISTICAS = [
  'intercepto',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'feriado',
  'vispera_feriado',
  'temporada_alta',
  'tendencia_anios',
] as const;

const MESES_TEMPORADA_ALTA = [7, 12];

/** dia de la semana de una fecha AAAA-MM-DD: 0 domingo ... 6 sabado */
export function diaDeLaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

export function caracteristicasDelDia(fecha: string, inicioSerie: string): number[] {
  const dia = diaDeLaSemana(fecha);
  const mes = Number(fecha.slice(5, 7));
  const anios = diasEntre(inicioSerie, fecha) / 365.25;

  return [
    1,
    ...[1, 2, 3, 4, 5, 6].map((d) => (dia === d ? 1 : 0)),
    esFeriado(fecha) ? 1 : 0,
    esVisperaDeFeriado(fecha) ? 1 : 0,
    MESES_TEMPORADA_ALTA.includes(mes) ? 1 : 0,
    anios,
  ];
}
