/** forma de todos los errores que devuelve la API */
export type RespuestaError = {
  codigo: string;
  mensaje: string;
  detalles?: unknown;
};
