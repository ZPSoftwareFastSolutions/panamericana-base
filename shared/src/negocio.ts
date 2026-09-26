/**
 * DATOS DEL NEGOCIO: razon social, NIT y contacto de la empresa. Es el UNICO lugar donde se escriben.
 * Los usan el pie del portal, los documentos legales y el boleto (el reglamento de transporte
 * pide los datos del operador en el pasaje) y la revision de seguridad antes de desplegar.
 *
 * Un dato en null todavia no lo confirmo la empresa: en desarrollo la web muestra "por completar"
 * y `npm run prueba:seguridad` no deja desplegar a produccion hasta completarlo.
 */
export type DatosNegocio = {
  nombre_comercial: string;
  razon_social: string | null;
  nit: string | null;
  /** direccion de la oficina principal (donde se atienden reclamos y solicitudes de datos) */
  direccion: string | null;
  ciudad: string;
  telefono: string | null;
  correo: string | null;
  /** registro o autorizacion de la ATT como operador de transporte interdepartamental */
  autorizacion_att: string | null;
};

export const NEGOCIO: DatosNegocio = {
  nombre_comercial: 'Panamericana',
  razon_social: null,
  nit: null,
  direccion: null,
  ciudad: 'La Paz, Bolivia',
  telefono: null,
  correo: null,
  autorizacion_att: null,
};

/** nombre legible de cada dato (para avisos y para la revision de seguridad) */
export const NOMBRES_DATOS_NEGOCIO: Record<keyof DatosNegocio, string> = {
  nombre_comercial: 'nombre comercial',
  razon_social: 'razón social',
  nit: 'NIT',
  direccion: 'dirección',
  ciudad: 'ciudad',
  telefono: 'teléfono',
  correo: 'correo',
  autorizacion_att: 'autorización de la ATT',
};

/** datos que faltan confirmar (vacio = listo para produccion) */
export function datosDelNegocioPendientes(datos: DatosNegocio = NEGOCIO): string[] {
  return (Object.keys(datos) as (keyof DatosNegocio)[])
    .filter((clave) => !datos[clave]?.trim())
    .map((clave) => NOMBRES_DATOS_NEGOCIO[clave]);
}
