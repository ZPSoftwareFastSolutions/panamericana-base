import type { Ciudad } from './catalogo';

/**
 * una terminal tal como la devuelve la API.
 * La ciudad viene completa (objeto anidado) para poder mostrar su nombre sin otra consulta.
 */
export type Terminal = {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
  ciudad: Ciudad;
};

/** datos que se envian para registrar una terminal */
export type RegistrarTerminalEntrada = {
  nombre: string;
  /** id de una ciudad del catalogo (GET /v1/catalogos/ciudades) */
  ciudad_id: string;
  direccion: string;
};
