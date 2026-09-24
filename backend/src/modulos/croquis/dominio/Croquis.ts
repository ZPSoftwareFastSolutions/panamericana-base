import { AsientoInvalidoError } from './errores';

/**
 * CROQUIS: los asientos fisicos de un bus y las reglas para dibujarlos.
 *
 * El croquis se dibuja con filas y columnas. El pasillo es una columna vacia:
 *   4 asientos por fila (semicama o normal): columnas 1 2 | 4 5   (la 3 es el pasillo)
 *   3 asientos por fila (cama):              columnas 1 | 3 4     (la 2 es el pasillo)
 */

export type DatosAsiento = {
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
};

export type AsientoDelBus = DatosAsiento & { id: string };

export type BusDelCroquis = {
  id: string;
  placa: string;
  numero_pisos: number;
};

export type PisoEstandar = {
  piso: number;
  filas: number;
  asientos_por_fila: 3 | 4;
  tipo: string;
};

const COLUMNAS: Record<3 | 4, number[]> = {
  4: [1, 2, 4, 5],
  3: [1, 3, 4],
};

const MAXIMO_FILAS = 20;

/** reglas de UN asiento: posicion dentro del bus y tipo del catalogo */
export function validarAsiento(
  asiento: DatosAsiento,
  bus: BusDelCroquis,
  tiposValidos: string[],
): void {
  const enteros = [asiento.numero, asiento.piso, asiento.fila, asiento.columna];
  if (enteros.some((valor) => !Number.isInteger(valor) || valor < 1)) {
    throw new AsientoInvalidoError('Numero, piso, fila y columna deben ser enteros mayores que 0');
  }
  if (asiento.piso > bus.numero_pisos) {
    throw new AsientoInvalidoError(`El bus ${bus.placa} solo tiene ${bus.numero_pisos} piso(s)`);
  }
  if (!tiposValidos.includes(asiento.tipo)) {
    throw new AsientoInvalidoError(
      `El tipo "${asiento.tipo}" no existe. Usa: ${tiposValidos.join(', ')}`,
    );
  }
}

/**
 * Genera el croquis estandar: numera los asientos de corrido, piso por piso,
 * fila por fila y de izquierda a derecha.
 */
export function generarCroquisEstandar(
  pisos: PisoEstandar[],
  bus: BusDelCroquis,
  tiposValidos: string[],
): DatosAsiento[] {
  if (pisos.length === 0) {
    throw new AsientoInvalidoError('Indica al menos un piso');
  }
  const numerosDePiso = pisos.map((p) => p.piso);
  if (new Set(numerosDePiso).size !== numerosDePiso.length) {
    throw new AsientoInvalidoError('Cada piso se indica una sola vez');
  }

  const asientos: DatosAsiento[] = [];
  let numero = 1;

  for (const piso of [...pisos].sort((a, b) => a.piso - b.piso)) {
    if (!Number.isInteger(piso.filas) || piso.filas < 1 || piso.filas > MAXIMO_FILAS) {
      throw new AsientoInvalidoError(`Cada piso tiene de 1 a ${MAXIMO_FILAS} filas`);
    }
    const columnas = COLUMNAS[piso.asientos_por_fila];
    if (!columnas) {
      throw new AsientoInvalidoError('Una fila tiene 3 asientos (cama) o 4 (semicama o normal)');
    }

    for (let fila = 1; fila <= piso.filas; fila++) {
      for (const columna of columnas) {
        const asiento = { numero, piso: piso.piso, fila, columna, tipo: piso.tipo };
        validarAsiento(asiento, bus, tiposValidos);
        asientos.push(asiento);
        numero++;
      }
    }
  }
  return asientos;
}

/** un asiento nuevo no puede repetir el numero ni la posicion de otro del mismo bus */
export function chocaConOtro(nuevo: DatosAsiento, existentes: DatosAsiento[]): string | null {
  if (existentes.some((a) => a.numero === nuevo.numero)) {
    return `Ya existe el asiento numero ${nuevo.numero}`;
  }
  const mismaPosicion = existentes.find(
    (a) => a.piso === nuevo.piso && a.fila === nuevo.fila && a.columna === nuevo.columna,
  );
  if (mismaPosicion) {
    return `Esa posicion ya la ocupa el asiento ${mismaPosicion.numero}`;
  }
  return null;
}
