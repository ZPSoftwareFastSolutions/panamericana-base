import { diaDeLaSemana } from '../dominio/Caracteristicas';
import { diasEntre, sumarDias } from '../../../compartido/dominio/Fechas';
import { esFeriado, esVisperaDeFeriado } from '../dominio/FeriadosBolivia';

/**
 * DATOS SINTETICOS de pasajes vendidos por ruta y por dia (24 meses).
 *
 * El MVP todavia no tiene historia de ventas, asi que se GENERA una con patrones conocidos
 * del transporte interdepartamental en Bolivia: mas viajes el viernes y el fin de semana,
 * en vísperas de feriado, en julio (vacaciones de invierno) y en diciembre, y un leve
 * crecimiento anual. Se declara como sintetico en el modelo y en el panel; cuando existan
 * ventas reales, se reentrena con ellas.
 *
 * Es reproducible: la misma semilla genera siempre los mismos datos.
 */

export type Observacion = { ruta: string; fecha: string; pasajes: number; base: number };

export const RUTAS_SINTETICAS: Record<string, number> = {
  'La Paz - Cochabamba': 70,
  'La Paz - Oruro': 45,
  'La Paz - Santa Cruz': 85,
};

export const INICIO_SERIE = '2024-09-01';
export const FIN_SERIE = '2026-08-31';

const EFECTO_DIA = [0.1, -0.1, -0.15, -0.12, -0.05, 0.25, 0.15]; // domingo ... sabado

/** generador pseudoaleatorio con semilla (mulberry32) */
function azarConSemilla(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ruido con distribucion normal (Box-Muller) */
function normal(azar: () => number): number {
  const u = Math.max(azar(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * azar());
}

export function generarDatosSinteticos(semilla = 2026): Observacion[] {
  const azar = azarConSemilla(semilla);
  const datos: Observacion[] = [];
  for (let fecha = INICIO_SERIE; fecha <= FIN_SERIE; fecha = sumarDias(fecha, 1)) {
    const mes = Number(fecha.slice(5, 7));
    const anios = diasEntre(INICIO_SERIE, fecha) / 365.25;
    for (const [ruta, base] of Object.entries(RUTAS_SINTETICAS)) {
      const indice =
        1 +
        EFECTO_DIA[diaDeLaSemana(fecha)]! +
        (esFeriado(fecha) ? 0.3 : 0) +
        (esVisperaDeFeriado(fecha) ? 0.35 : 0) +
        (mes === 7 || mes === 12 ? 0.18 : 0) +
        0.06 * anios +
        0.08 * normal(azar);
      datos.push({ ruta, fecha, base, pasajes: Math.max(0, Math.round(base * indice)) });
    }
  }
  return datos;
}
