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

  catalogos: {
    /** GET listar las ciudades activas */
    ciudades: '/v1/catalogos/ciudades',
    /** GET listar los tipos de documento: ci, ce, pasaporte */
    tiposDocumento: '/v1/catalogos/tipos-documento',
    /** GET listar los roles de usuario */
    roles: '/v1/catalogos/roles',
  },

  terminales: {
    /** GET listar · POST registrar */
    base: '/v1/terminales',
    /** GET detalle (formato para Express) */
    porId: '/v1/terminales/:id',
    /** formato para la web */
    detalle: (id: string): string => `/v1/terminales/${id}`,
  },

  usuarios: {
    /** GET listar · POST registrar */
    base: '/v1/usuarios',
  },

  clientes: {
    /** GET listar · POST registrar */
    base: '/v1/clientes',
    /** GET buscar por documento (formato para Express) */
    buscar: '/v1/clientes/buscar',
    /** formato para la web: arma la busqueda con sus parametros */
    buscarPorDocumento: (tipo_documento: string, numero_documento: string): string =>
      `/v1/clientes/buscar?tipo_documento=${encodeURIComponent(tipo_documento)}` +
      `&numero_documento=${encodeURIComponent(numero_documento)}`,
  },
} as const;
