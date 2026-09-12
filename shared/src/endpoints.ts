/**
 * RUTAS DE LA API — el unico lugar donde se escriben las direcciones de los endpoints.
 *
 * El backend las usa para registrar las rutas de Express (formato con ":id").
 * La web las usa para construir la URL de la peticion (funciones que reciben el id).
 *
 * Si una ruta cambia aqui, backend y web se enteran al mismo tiempo.
 */
export const RUTAS_API = {
  salud: '/salud',

  buses: {
    /** GET listar · POST registrar */
    base: '/v1/buses',
    /** formato para Express */
    porId: '/v1/buses/:id',
    /** formato para la web */
    detalle: (id: string): string => `/v1/buses/${id}`,
  },
} as const;
