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
    /** PUT cambiar el tipo de un asiento (formato para Express) */
    asiento: '/v1/buses/:id/asientos/:asientoId',
    /** formato para la web */
    delBus: (busId: string): string => `/v1/buses/${busId}/asientos`,
    generarDelBus: (busId: string): string => `/v1/buses/${busId}/asientos/generar`,
    asientoDelBus: (busId: string, asientoId: string): string => `/v1/buses/${busId}/asientos/${asientoId}`,
  },

  catalogos: {
    /** GET listar las ciudades activas */
    ciudades: '/v1/catalogos/ciudades',
    /** GET listar los tipos de documento: ci, ce, pasaporte */
    tiposDocumento: '/v1/catalogos/tipos-documento',
    /** GET listar los roles de usuario */
    roles: '/v1/catalogos/roles',
    /** GET listar los tipos de asiento: normal, semicama, cama */
    tiposAsiento: '/v1/catalogos/tipos-asiento',
    /** GET listar las tarifas diferenciadas que exige la ley (adulto mayor, discapacidad, menor) */
    tiposPasajero: '/v1/catalogos/tipos-pasajero',
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
    /** PUT reemplazar las tarifas de un viaje programado (formato para Express) */
    tarifas: '/v1/viajes/:id/tarifas',
    /** formato para la web */
    buscarCon: (origen: string, destino: string, fecha: string): string =>
      `/v1/viajes/buscar?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}` +
      `&fecha=${encodeURIComponent(fecha)}`,
    asientosDelTramo: (viajeId: string, desde: number, hasta: number): string =>
      `/v1/viajes/${viajeId}/asientos?desde=${desde}&hasta=${hasta}`,
    tarifasDelViaje: (viajeId: string): string => `/v1/viajes/${viajeId}/tarifas`,
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

  taquilla: {
    /** POST vender en taquilla: reserva y cobra en efectivo (vendedor o administrador) */
    ventas: '/v1/taquilla/ventas',
  },

  pasajes: {
    /** GET ver un pasaje por su codigo: el boleto (publico) — formato para Express */
    porCodigo: '/v1/pasajes/:codigo',
    /** POST anular un pasaje pagado hasta 2 h antes de subir (vendedor o administrador) */
    anular: '/v1/pasajes/:codigo/anular',
    /** formato para la web */
    detalle: (codigo: string): string => `/v1/pasajes/${encodeURIComponent(codigo)}`,
    anularPasaje: (codigo: string): string => `/v1/pasajes/${encodeURIComponent(codigo)}/anular`,
  },

  encomiendas: {
    /** GET listar (?estado=) · POST registrar y cobrar */
    base: '/v1/encomiendas',
    /** GET detalle con su historial (formato para Express) */
    porCodigo: '/v1/encomiendas/:codigo',
    /** POST cambiar el estado (formato para Express) */
    estado: '/v1/encomiendas/:codigo/estado',
    /** GET seguimiento publico, sin datos personales (formato para Express) */
    seguimiento: '/v1/seguimiento/:codigo',
    /** formato para la web */
    listarCon: (estado?: string): string =>
      estado ? `/v1/encomiendas?estado=${encodeURIComponent(estado)}` : '/v1/encomiendas',
    detalle: (codigo: string): string => `/v1/encomiendas/${encodeURIComponent(codigo)}`,
    cambiarEstado: (codigo: string): string => `/v1/encomiendas/${encodeURIComponent(codigo)}/estado`,
    seguimientoDe: (codigo: string): string => `/v1/seguimiento/${encodeURIComponent(codigo)}`,
  },

  panel: {
    /** GET indicadores de ventas, ingresos, ocupacion y encomiendas (?desde=&hasta=&ruta_id=) */
    indicadores: '/v1/panel/indicadores',
    /** GET demanda estimada de los proximos dias por ruta (?dias=7) */
    prediccion: '/v1/panel/prediccion',
    /** formato para la web */
    indicadoresCon: (filtro: { desde?: string; hasta?: string; ruta_id?: string }): string => {
      const parametros = new URLSearchParams();
      for (const [clave, valor] of Object.entries(filtro)) if (valor) parametros.set(clave, valor);
      const consulta = parametros.toString();
      return consulta ? `/v1/panel/indicadores?${consulta}` : '/v1/panel/indicadores';
    },
    prediccionDe: (dias: number): string => `/v1/panel/prediccion?dias=${dias}`,
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
