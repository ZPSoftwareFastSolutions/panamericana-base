/** forma de todos los errores que devuelve la API */
export type RespuestaError = {
  codigo: string;
  mensaje: string;
  detalles?: unknown;
};

/** documentos de identidad aceptados en Bolivia (catalogo tipos_documento) */
export type TipoDocumento = 'ci' | 'ce' | 'pasaporte';
