import { DatoObligatorioError } from '../../../compartido/dominio/erroresComunes';
import { RutaInvalidaError } from './errores';

/**
 * RUTA: un recorrido con paradas ordenadas. El origen es la parada 1 y el destino la ultima.
 * Es lo que permite vender TRAMOS: de cualquier parada a cualquier parada posterior.
 * La duracion y la distancia no se guardan: salen de las paradas (vista rutas_resumen).
 */

export type ParadaEntrada = {
  terminal_id: string;
  minutos_desde_origen: number;
  km_desde_origen?: number | null;
};

export type Parada = {
  orden: number;
  terminal_id: string;
  minutos_desde_origen: number;
  km_desde_origen: number | null;
};

export type NuevaRuta = {
  id: string;
  nombre: string;
  paradas: Parada[];
};

/** valida el recorrido y numera las paradas en el orden recibido (1 = origen) */
export function crearRuta(datos: { nombre: string; paradas: ParadaEntrada[] }): NuevaRuta {
  const nombre = datos.nombre.trim().replace(/\s+/g, ' ');
  if (nombre === '') throw new DatoObligatorioError('nombre');

  if (datos.paradas.length < 2) {
    throw new RutaInvalidaError('Una ruta necesita al menos 2 paradas: origen y destino');
  }

  const terminales = datos.paradas.map((p) => p.terminal_id);
  if (new Set(terminales).size !== terminales.length) {
    throw new RutaInvalidaError('Una terminal no puede repetirse dentro de la misma ruta');
  }

  const paradas = datos.paradas.map((parada, indice) => ({
    orden: indice + 1,
    terminal_id: parada.terminal_id,
    minutos_desde_origen: parada.minutos_desde_origen,
    km_desde_origen: parada.km_desde_origen ?? null,
  }));

  if (paradas[0]?.minutos_desde_origen !== 0) {
    throw new RutaInvalidaError('La primera parada es el origen: sus minutos desde el origen son 0');
  }

  for (let i = 1; i < paradas.length; i++) {
    const anterior = paradas[i - 1]!;
    const actual = paradas[i]!;
    if (!Number.isInteger(actual.minutos_desde_origen) || actual.minutos_desde_origen <= anterior.minutos_desde_origen) {
      throw new RutaInvalidaError(
        `La parada ${actual.orden} debe llegar después que la parada ${anterior.orden} (minutos crecientes)`,
      );
    }
    if (
      actual.km_desde_origen !== null &&
      anterior.km_desde_origen !== null &&
      actual.km_desde_origen < anterior.km_desde_origen
    ) {
      throw new RutaInvalidaError(`Los kilometros de la parada ${actual.orden} no pueden bajar`);
    }
  }

  if (paradas.some((p) => p.km_desde_origen !== null && p.km_desde_origen < 0)) {
    throw new RutaInvalidaError('Los kilometros no pueden ser negativos');
  }

  return { id: crypto.randomUUID(), nombre, paradas };
}
