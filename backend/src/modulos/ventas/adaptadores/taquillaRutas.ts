import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_VENTA, usuarioEnSesion } from '../../../compartido/adaptadores/http/autorizacion';
import type { AnularPasaje } from '../casos-de-uso/AnularPasaje';
import type { VenderEnTaquilla } from '../casos-de-uso/VenderEnTaquilla';
import { esquemaReserva } from './ventaRutas';

const esquemaCodigo = z.object({ codigo: z.string().min(3).max(20) });

/**
 * Adaptador HTTP de la TAQUILLA: venta presencial en efectivo y anulacion de pasajes.
 * Solo vendedores y administradores; el vendedor queda registrado en la venta.
 */
export function taquillaRutas(
  casos: { venderEnTaquilla: VenderEnTaquilla; anularPasaje: AnularPasaje },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  router.post(RUTAS_API.taquilla.ventas, autorizacion.requiere(...ROLES_VENTA), async (req, res) => {
    const entrada = esquemaReserva.parse(req.body);
    const vendedor = usuarioEnSesion(res);
    res.status(201).json(await casos.venderEnTaquilla.ejecutar(entrada, vendedor.id));
  });

  router.post(RUTAS_API.pasajes.anular, autorizacion.requiere(...ROLES_VENTA), async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.anularPasaje.ejecutar(codigo));
  });

  return router;
}
