import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { PredecirDemanda } from '../casos-de-uso/PredecirDemanda';

const esquemaDias = z.object({ dias: z.coerce.number().int().default(7) });

/** Adaptador HTTP del modulo prediccion: la demanda estimada del panel (solo administradora) */
export function prediccionRutas(casos: { predecirDemanda: PredecirDemanda }, autorizacion: Autorizacion): Router {
  const router = Router();

  router.get(RUTAS_API.panel.prediccion, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const { dias } = esquemaDias.parse(req.query);
    res.json(await casos.predecirDemanda.ejecutar(dias));
  });

  return router;
}
