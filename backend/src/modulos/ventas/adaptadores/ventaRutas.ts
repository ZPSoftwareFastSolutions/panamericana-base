import { Router } from 'express';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { ObtenerPasaje } from '../casos-de-uso/ObtenerPasaje';
import type { ObtenerVenta } from '../casos-de-uso/ObtenerVenta';
import type { PagarVenta } from '../casos-de-uso/PagarVenta';
import type { ReservarAsientos } from '../casos-de-uso/ReservarAsientos';

/** forma de una reserva (la usa tambien la taquilla) */
export const esquemaReserva = z.object({
  viaje_id: z.uuid(),
  orden_origen: z.number().int(),
  orden_destino: z.number().int(),
  pasajeros: z.array(
    z.object({
      asiento_id: z.uuid(),
      tipo_documento: z.string().min(1),
      numero_documento: z.string().min(1),
      nombres: z.string().min(1),
      apellidos: z.string().min(1),
      telefono: z.string().nullable().optional(),
      correo: z.string().nullable().optional(),
      tipo_pasajero: z.string().min(1).optional(),
    }),
  ),
  acepta_condiciones: z.boolean(),
});

const esquemaCodigo = z.object({ codigo: z.string().min(3).max(20) });

/**
 * Adaptador HTTP del modulo ventas para el PORTAL (compra como invitado, sin sesion).
 * El canal es siempre "web" y el pago simulado con "tarjeta". La taquilla tiene sus propias
 * rutas (taquillaRutas.ts). Tambien es publico el boleto de un pasaje.
 */
export function ventaRutas(
  casos: {
    reservarAsientos: ReservarAsientos;
    obtenerVenta: ObtenerVenta;
    pagarVenta: PagarVenta;
    obtenerPasaje: ObtenerPasaje;
  },
  limiteReservas: RequestHandler,
): Router {
  const router = Router();

  // limiteReservas: una misma IP no puede reservar sin fin (los asientos quedan retenidos)
  router.post(RUTAS_API.ventas.reservas, limiteReservas, async (req, res) => {
    const entrada = esquemaReserva.parse(req.body);
    const venta = await casos.reservarAsientos.ejecutar(entrada, { canal: 'web', usuario_id: null });
    res.status(201).json(venta);
  });

  router.get(RUTAS_API.ventas.porCodigo, async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.obtenerVenta.ejecutar(codigo));
  });

  router.post(RUTAS_API.ventas.pagar, async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.pagarVenta.ejecutar(codigo, { metodo: 'tarjeta' }));
  });

  // publico: el boleto de un pasaje (documento oculto)
  router.get(RUTAS_API.pasajes.porCodigo, async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.obtenerPasaje.ejecutar(codigo));
  });

  return router;
}
