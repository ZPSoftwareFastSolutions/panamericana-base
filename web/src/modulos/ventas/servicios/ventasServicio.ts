import { RUTAS_API } from '@panamericana/shared';
import type { ReservarEntrada, Venta } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/** SERVICIO de ventas del portal: reservar, ver y pagar (compra como invitado) */
export const ventasServicio = {
  reservar: (datos: ReservarEntrada) => clienteHttp.post<Venta>(RUTAS_API.ventas.reservas, datos),
  obtener: (codigo: string) => clienteHttp.get<Venta>(RUTAS_API.ventas.detalle(codigo)),
  pagar: (codigo: string) => clienteHttp.post<Venta>(RUTAS_API.ventas.pagarVenta(codigo), {}),
};
