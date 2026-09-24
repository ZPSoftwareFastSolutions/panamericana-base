import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { ObtenerIndicadores } from '../casos-de-uso/ObtenerIndicadores';

const esquemaFiltro = z.object({
  desde: z.string().optional(),
  hasta: z.string().optional(),
  ruta_id: z.uuid().optional(),
});

/** Adaptador HTTP del panel de indicadores (solo administradora) */
export function panelRutas(casos: { obtenerIndicadores: ObtenerIndicadores }, autorizacion: Autorizacion): Router {
  const router = Router();

  router.get(RUTAS_API.panel.indicadores, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const filtro = esquemaFiltro.parse(req.query);
    res.json(await casos.obtenerIndicadores.ejecutar(filtro));
  });

  return router;
}
