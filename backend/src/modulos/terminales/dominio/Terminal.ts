import { DatoObligatorioError } from '../../../compartido/dominio/erroresComunes';

/** la ciudad donde esta la terminal (se muestra completa, no solo su id) */
export type CiudadDeTerminal = {
  id: string;
  nombre: string;
  departamento: string;
};

export type DatosNuevaTerminal = {
  nombre: string;
  direccion: string;
  /** la ciudad ya verificada por el caso de uso */
  ciudad: CiudadDeTerminal;
};

/**
 * Entidad del dominio: una terminal de buses (punto de salida, paso o llegada de una ruta).
 * No importa Express ni pg.
 */
export class Terminal {
  private constructor(
    readonly id: string,
    readonly nombre: string,
    readonly direccion: string,
    readonly activo: boolean,
    readonly ciudad: CiudadDeTerminal,
  ) {}

  /** crea una terminal nueva aplicando las reglas del negocio */
  static crear(datos: DatosNuevaTerminal): Terminal {
    const nombre = datos.nombre.trim().replace(/\s+/g, ' ');
    const direccion = datos.direccion.trim().replace(/\s+/g, ' ');

    if (nombre === '') throw new DatoObligatorioError('nombre');
    if (direccion === '') throw new DatoObligatorioError('direccion');

    return new Terminal(crypto.randomUUID(), nombre, direccion, true, datos.ciudad);
  }

  /** reconstruye una terminal que ya existe en la base (no vuelve a validar) */
  static reconstruir(datos: {
    id: string;
    nombre: string;
    direccion: string;
    activo: boolean;
    ciudad: CiudadDeTerminal;
  }): Terminal {
    return new Terminal(datos.id, datos.nombre, datos.direccion, datos.activo, datos.ciudad);
  }
}
