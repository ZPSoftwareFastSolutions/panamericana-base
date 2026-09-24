import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_INTERNOS, SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { ListarRutas } from '../casos-de-uso/ListarRutas';
import type { ObtenerRuta } from '../casos-de-uso/ObtenerRuta';
import type { RegistrarRuta } from '../casos-de-uso/RegistrarRuta';

const esquemaRegistrarRuta = z.object({
  nombre: z.string().min(1),
  paradas: z.array(
    z.object({
      terminal_id: z.uuid(),
      minutos_desde_origen: z.number().int(),
      km_desde_origen: z.number().nullable().optional(),
    }),
  ),
});

const esquemaId = z.object({ id: z.uuid() });

/**
 * Adaptador HTTP del modulo rutas.
 * (El archivo se llama rutaRutas porque el modulo se llama "rutas", igual que busRutas o terminalRutas.)
 */
export function rutaRutas(
  casos: { listarRutas: ListarRutas; obtenerRuta: ObtenerRuta; registrarRuta: RegistrarRuta },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  router.get(RUTAS_API.rutas.base, autorizacion.requiere(...ROLES_INTERNOS), async (_req, res) => {
    res.json(await casos.listarRutas.ejecutar());
  });

  router.get(RUTAS_API.rutas.porId, autorizacion.requiere(...ROLES_INTERNOS), async (req, res) => {
    const { id } = esquemaId.parse(req.params);
    res.json(await casos.obtenerRuta.ejecutar(id));
  });

  router.post(RUTAS_API.rutas.base, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const entrada = esquemaRegistrarRuta.parse(req.body);
    res.status(201).json(await casos.registrarRuta.ejecutar(entrada));
  });

  return router;
}
