import type { NuevaRuta } from './Ruta';

/** una ruta tal como se muestra: con sus paradas, terminales y el resumen calculado */
export type RutaDetalle = {
  id: string;
  nombre: string;
  activo: boolean;
  duracion_estimada_min: number;
  distancia_km: number | null;
  paradas: {
    orden: number;
    minutos_desde_origen: number;
    km_desde_origen: number | null;
    terminal: { id: string; nombre: string; ciudad: string };
  }[];
};

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface RutaRepositorio {
  listar(): Promise<RutaDetalle[]>;
  buscarPorId(id: string): Promise<RutaDetalle | null>;
  /** compara sin importar mayusculas */
  existeNombre(nombre: string): Promise<boolean>;
  /** de los ids recibidos, devuelve los de terminales que existen y estan activas */
  terminalesActivas(ids: string[]): Promise<string[]>;
  /** guarda la ruta y sus paradas juntas */
  guardar(ruta: NuevaRuta): Promise<void>;
}
