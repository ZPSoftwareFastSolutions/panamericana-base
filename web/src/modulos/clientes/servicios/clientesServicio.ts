import { RUTAS_API } from '@panamericana/shared';
import type { Cliente, RegistrarClienteEntrada } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de clientes: traduce "lo que quiero hacer" en una llamada a la API.
 * buscarPorDocumento lo usaran la compra web y la taquilla (Sprint 2 y 3).
 */
export const clientesServicio = {
  listar: () => clienteHttp.get<Cliente[]>(RUTAS_API.clientes.base),
  registrar: (datos: RegistrarClienteEntrada) =>
    clienteHttp.post<Cliente>(RUTAS_API.clientes.base, datos),
  buscarPorDocumento: (tipo_documento: string, numero_documento: string) =>
    clienteHttp.get<Cliente>(RUTAS_API.clientes.buscarPorDocumento(tipo_documento, numero_documento)),
};
