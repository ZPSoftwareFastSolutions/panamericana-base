import { RUTAS_API } from '@panamericana/shared';
import type { DisponibilidadTramo, ProgramarViajeEntrada, ResultadoBusqueda, Viaje } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de viajes.
 *  - backoffice: listar y programar (con sesion de administrador)
 *  - portal: buscar y ver los asientos de un tramo (sin sesion)
 */
export const viajesServicio = {
  listar: () => clienteHttp.get<Viaje[]>(RUTAS_API.viajes.base),
  programar: (datos: ProgramarViajeEntrada) => clienteHttp.post<Viaje>(RUTAS_API.viajes.base, datos),
  buscar: (origen: string, destino: string, fecha: string) =>
    clienteHttp.get<ResultadoBusqueda[]>(RUTAS_API.viajes.buscarCon(origen, destino, fecha)),
  disponibilidad: (viajeId: string, desde: number, hasta: number) =>
    clienteHttp.get<DisponibilidadTramo>(RUTAS_API.viajes.asientosDelTramo(viajeId, desde, hasta)),
};
