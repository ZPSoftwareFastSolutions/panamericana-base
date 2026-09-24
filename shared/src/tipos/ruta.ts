/** una parada de la ruta (tabla rutas_paradas) con su terminal resumida */
export type ParadaRuta = {
  orden: number;
  minutos_desde_origen: number;
  km_desde_origen: number | null;
  terminal: {
    id: string;
    nombre: string;
    ciudad: string;
  };
};

/**
 * una ruta tal como la devuelve la API.
 * La duracion y la distancia NO se guardan: salen de la vista rutas_resumen.
 */
export type Ruta = {
  id: string;
  nombre: string;
  activo: boolean;
  duracion_estimada_min: number;
  distancia_km: number | null;
  paradas: ParadaRuta[];
};

/** una parada al registrar: el orden es la posicion en la lista (1 = origen) */
export type ParadaRutaEntrada = {
  terminal_id: string;
  minutos_desde_origen: number;
  km_desde_origen?: number | null;
};

export type RegistrarRutaEntrada = {
  nombre: string;
  paradas: ParadaRutaEntrada[];
};
