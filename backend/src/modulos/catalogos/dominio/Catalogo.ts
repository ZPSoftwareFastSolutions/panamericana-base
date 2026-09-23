/**
 * Catalogos: listas de valores que el sistema necesita para llenar formularios
 * (ciudades, tipos de documento, roles). Son DATOS en tablas, no listas escritas en el codigo:
 * agregar una ciudad o un rol es insertar una fila, sin tocar el programa.
 *
 * Este modulo solo LEE. Por eso no tiene reglas de negocio ni errores propios.
 */

/** una ciudad (mismos nombres que la tabla ciudades) */
export type Ciudad = {
  id: string;
  nombre: string;
  departamento: string;
};

/** un valor de un catalogo simple: codigo + nombre visible */
export type ElementoCatalogo = {
  codigo: string;
  nombre: string;
};
