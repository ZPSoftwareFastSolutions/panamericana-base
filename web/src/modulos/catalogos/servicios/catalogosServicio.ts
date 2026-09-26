import { RUTAS_API } from '@panamericana/shared';
import type { Ciudad, ElementoCatalogo, TipoPasajero } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de catalogos: las listas para llenar los selectores de los formularios.
 * Lo usan otros modulos (terminales usa ciudades; clientes usa tipos de documento).
 */
export const catalogosServicio = {
  ciudades: () => clienteHttp.get<Ciudad[]>(RUTAS_API.catalogos.ciudades),
  tiposDocumento: () => clienteHttp.get<ElementoCatalogo[]>(RUTAS_API.catalogos.tiposDocumento),
  roles: () => clienteHttp.get<ElementoCatalogo[]>(RUTAS_API.catalogos.roles),
  tiposAsiento: () => clienteHttp.get<ElementoCatalogo[]>(RUTAS_API.catalogos.tiposAsiento),
  tiposPasajero: () => clienteHttp.get<TipoPasajero[]>(RUTAS_API.catalogos.tiposPasajero),
};
