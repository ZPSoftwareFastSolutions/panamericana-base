import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { ListarTerminales } from '../casos-de-uso/ListarTerminales';
import type { ObtenerTerminal } from '../casos-de-uso/ObtenerTerminal';
import type { RegistrarTerminal } from '../casos-de-uso/RegistrarTerminal';

/**
 * Adaptador HTTP del modulo terminales.
 * Zod valida la FORMA del JSON; las reglas del negocio las valida el dominio.
 */
const esquemaRegistrarTerminal = z.object({
  nombre: z.string().min(1),
  ciudad_id: z.uuid(),
  direccion: z.string().min(1),
});

const esquemaId = z.object({ id: z.uuid() });

export function terminalRutas(casos: {
  listarTerminales: ListarTerminales;
  obtenerTerminal: ObtenerTerminal;
  registrarTerminal: RegistrarTerminal;
}): Router {
  const router = Router();

  router.get(RUTAS_API.terminales.base, async (_req, res) => {
    res.json(await casos.listarTerminales.ejecutar());
  });

  router.get(RUTAS_API.terminales.porId, async (req, res) => {
    const { id } = esquemaId.parse(req.params);
    res.json(await casos.obtenerTerminal.ejecutar(id));
  });

  router.post(RUTAS_API.terminales.base, async (req, res) => {
    const entrada = esquemaRegistrarTerminal.parse(req.body);
    const terminal = await casos.registrarTerminal.ejecutar(entrada);
    res.status(201).json(terminal);
  });

  return router;
}
