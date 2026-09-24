/** un asiento fisico del bus (mismos nombres que la tabla asientos) */
export type Asiento = {
  id: string;
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  /** codigo del catalogo tipos_asiento: 'normal', 'semicama', 'cama' */
  tipo: string;
};

/** el croquis completo de un bus: sus pisos y sus asientos */
export type Croquis = {
  bus_id: string;
  placa: string;
  numero_pisos: number;
  asientos: Asiento[];
};

/** como se arma un piso al generar el croquis estandar */
export type PisoCroquisEntrada = {
  piso: number;
  filas: number;
  /** 4 = dos y dos (semicama o normal) · 3 = uno y dos (cama) */
  asientos_por_fila: 3 | 4;
  tipo: string;
};

export type GenerarCroquisEntrada = {
  pisos: PisoCroquisEntrada[];
};

export type RegistrarAsientoEntrada = {
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  tipo: string;
};

/** cambiar el tipo de un asiento desde el editor del croquis */
export type CambiarTipoAsientoEntrada = {
  tipo: string;
};
