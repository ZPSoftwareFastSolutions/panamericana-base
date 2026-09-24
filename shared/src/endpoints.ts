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

  sesion: {
    /** GET datos del usuario que inicio sesion (requiere el token) */
    actual: '/v1/sesion',
  },

  buses: {
    /** GET listar · POST registrar */
    base: '/v1/buses',
    /** formato para Express */
    porId: '/v1/buses/:id',
    /** formato para la web */
    detalle: (id: string): string => `/v1/buses/${id}`,
  },

  croquis: {
    /** GET croquis del bus · POST registrar un asiento suelto (formato para Express) */
    porBus: '/v1/buses/:id/asientos',
    /** POST generar el croquis estandar de un bus sin asientos (formato para Express) */
    generar: '/v1/buses/:id/asientos/generar',
    /** formato para la web */
    delBus: (busId: string): string => `/v1/buses/${busId}/asientos`,
    generarDelBus: (busId: string): string => `/v1/buses/${busId}/asientos/generar`,
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

  rutas: {
    /** GET listar · POST registrar con sus paradas */
    base: '/v1/rutas',
    /** GET detalle (formato para Express) */
    porId: '/v1/rutas/:id',
    detalle: (id: string): string => `/v1/rutas/${id}`,
  },

  viajes: {
    /** GET listar (backoffice) · POST programar */
    base: '/v1/viajes',
    /** GET buscar viajes por ciudad de origen, destino y fecha (portal, sin sesion) */
    buscar: '/v1/viajes/buscar',
    /** GET asientos libres para un tramo (portal, sin sesion) — formato para Express */
    asientos: '/v1/viajes/:id/asientos',
    /** formato para la web */
    buscarCon: (origen: string, destino: string, fecha: string): string =>
      `/v1/viajes/buscar?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}` +
      `&fecha=${encodeURIComponent(fecha)}`,
    asientosDelTramo: (viajeId: string, desde: number, hasta: number): string =>
      `/v1/viajes/${viajeId}/asientos?desde=${desde}&hasta=${hasta}`,
  },

  ventas: {
    /** POST reservar asientos de un tramo (crea la venta pendiente) */
    reservas: '/v1/ventas/reservas',
    /** GET ver una venta por su codigo (formato para Express) */
    porCodigo: '/v1/ventas/:codigo',
    /** POST pagar (simulado) una venta pendiente (formato para Express) */
    pagar: '/v1/ventas/:codigo/pagar',
    /** formato para la web */
    detalle: (codigo: string): string => `/v1/ventas/${encodeURIComponent(codigo)}`,
    pagarVenta: (codigo: string): string => `/v1/ventas/${encodeURIComponent(codigo)}/pagar`,
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
