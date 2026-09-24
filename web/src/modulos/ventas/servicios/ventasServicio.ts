import { RUTAS_API } from '@panamericana/shared';
import type { AnulacionPasaje, Pasaje, ReservarEntrada, VenderEnTaquillaEntrada, Venta } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/**
 * SERVICIO de ventas.
 *  - portal: reservar, ver y pagar (compra como invitado) y ver el boleto de un pasaje
 *  - taquilla: vender en efectivo y anular un pasaje (con sesion de vendedor)
 */
export const ventasServicio = {
  reservar: (datos: ReservarEntrada) => clienteHttp.post<Venta>(RUTAS_API.ventas.reservas, datos),
  obtener: (codigo: string) => clienteHttp.get<Venta>(RUTAS_API.ventas.detalle(codigo)),
  pagar: (codigo: string) => clienteHttp.post<Venta>(RUTAS_API.ventas.pagarVenta(codigo), {}),
  pasaje: (codigo: string) => clienteHttp.get<Pasaje>(RUTAS_API.pasajes.detalle(codigo)),
  venderEnTaquilla: (datos: VenderEnTaquillaEntrada) => clienteHttp.post<Venta>(RUTAS_API.taquilla.ventas, datos),
  anularPasaje: (codigo: string) => clienteHttp.post<AnulacionPasaje>(RUTAS_API.pasajes.anularPasaje(codigo), {}),
};
