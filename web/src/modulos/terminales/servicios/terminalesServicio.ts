import { RUTAS_API } from '@panamericana/shared';
import type { RegistrarTerminalEntrada, Terminal } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de terminales: traduce "lo que quiero hacer" en una llamada a la API.
 * Las direcciones vienen de @panamericana/shared, nunca escritas a mano.
 */
export const terminalesServicio = {
  listar: () => clienteHttp.get<Terminal[]>(RUTAS_API.terminales.base),
  obtener: (id: string) => clienteHttp.get<Terminal>(RUTAS_API.terminales.detalle(id)),
  registrar: (datos: RegistrarTerminalEntrada) =>
    clienteHttp.post<Terminal>(RUTAS_API.terminales.base, datos),
};
