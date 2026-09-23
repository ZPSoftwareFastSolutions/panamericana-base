/** una ciudad del catalogo (mismos nombres que la tabla ciudades) */
export type Ciudad = {
  id: string;
  nombre: string;
  /** codigo del departamento: 'lp', 'cb', 'or'... */
  departamento: string;
};

/** un valor de un catalogo simple (tipos de documento, roles...): codigo + nombre visible */
export type ElementoCatalogo = {
  codigo: string;
  nombre: string;
};
