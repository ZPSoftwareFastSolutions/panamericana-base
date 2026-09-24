import { RUTAS_API } from '@panamericana/shared';
import type {
  CambiarEstadoEncomiendaEntrada,
  Encomienda,
  EstadoEncomienda,
  RegistrarEncomiendaEntrada,
  SeguimientoEncomienda,
} from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de encomiendas.
 *  - panel: listar, registrar, ver y cambiar el estado (personal de encomiendas)
 *  - portal: seguimiento por codigo (sin sesion)
 */
export const encomiendasServicio = {
  listar: (estado?: EstadoEncomienda) => clienteHttp.get<Encomienda[]>(RUTAS_API.encomiendas.listarCon(estado)),
  registrar: (datos: RegistrarEncomiendaEntrada) => clienteHttp.post<Encomienda>(RUTAS_API.encomiendas.base, datos),
  obtener: (codigo: string) => clienteHttp.get<Encomienda>(RUTAS_API.encomiendas.detalle(codigo)),
  cambiarEstado: (codigo: string, datos: CambiarEstadoEncomiendaEntrada) =>
    clienteHttp.post<Encomienda>(RUTAS_API.encomiendas.cambiarEstado(codigo), datos),
  seguimiento: (codigo: string) =>
    clienteHttp.get<SeguimientoEncomienda>(RUTAS_API.encomiendas.seguimientoDe(codigo)),
};
