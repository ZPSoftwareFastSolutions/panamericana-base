/**
 * FERIADOS NACIONALES DE BOLIVIA: mueven la demanda de pasajes, por eso el modelo los usa.
 *
 * Fijos: Año Nuevo (1/1), Estado Plurinacional (22/1), Dia del Trabajo (1/5),
 * Año Nuevo Andino Amazonico (21/6), Independencia (6/8), Todos Santos (2/11) y Navidad (25/12).
 * Moviles (dependen de la Pascua): lunes y martes de Carnaval, Viernes Santo y Corpus Christi.
 *
 * Las fechas se manejan como texto AAAA-MM-DD (dias de La Paz), sin horas.
 */
import { sumarDias } from '../../../compartido/dominio/Fechas';

const FIJOS = ['01-01', '01-22', '05-01', '06-21', '08-06', '11-02', '12-25'];

/** domingo de Pascua (algoritmo anonimo gregoriano) */
export function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anio, mes - 1, dia));
}

const texto = (fecha: Date) => fecha.toISOString().slice(0, 10);
const cache = new Map<number, Set<string>>();

export function feriadosDelAnio(anio: number): Set<string> {
  const guardado = cache.get(anio);
  if (guardado) return guardado;

  const pascua = texto(domingoDePascua(anio));
  const feriados = new Set([
    ...FIJOS.map((dia) => `${anio}-${dia}`),
    sumarDias(pascua, -48), // lunes de Carnaval
    sumarDias(pascua, -47), // martes de Carnaval
    sumarDias(pascua, -2), // Viernes Santo
    sumarDias(pascua, 60), // Corpus Christi
  ]);
  cache.set(anio, feriados);
  return feriados;
}

export function esFeriado(fecha: string): boolean {
  return feriadosDelAnio(Number(fecha.slice(0, 4))).has(fecha);
}

/** el dia anterior a un feriado la gente viaja mas */
export function esVisperaDeFeriado(fecha: string): boolean {
  return esFeriado(sumarDias(fecha, 1));
}
