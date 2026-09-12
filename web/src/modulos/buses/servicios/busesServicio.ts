import { RUTAS_API } from '@panamericana/shared';
import type { Bus, RegistrarBusEntrada } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO: traduce "lo que quiero hacer" en una llamada a la API.
 * Las direcciones vienen de @panamericana/shared, nunca escritas a mano.
 */
export const busesServicio = {
  listar: () => clienteHttp.get<Bus[]>(RUTAS_API.buses.base),
  registrar: (datos: RegistrarBusEntrada) => clienteHttp.post<Bus>(RUTAS_API.buses.base, datos),
};
