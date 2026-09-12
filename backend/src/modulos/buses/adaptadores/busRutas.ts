import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { ListarBuses } from '../casos-de-uso/ListarBuses';
import type { RegistrarBus } from '../casos-de-uso/RegistrarBus';

/**
 * Adaptador HTTP: traduce una peticion web en una llamada a un caso de uso.
 * Zod valida la FORMA del JSON; las reglas del negocio las valida el dominio.
 */
const esquemaRegistrarBus = z.object({
  placa: z.string().min(1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  anio_fabricacion: z.number().int().nullable().optional(),
  numero_pisos: z.number().int(),
});

export function busRutas(casos: {
  listarBuses: ListarBuses;
  registrarBus: RegistrarBus;
}): Router {
  const router = Router();

  router.get(RUTAS_API.buses.base, async (_req, res) => {
    const buses = await casos.listarBuses.ejecutar();
    res.json(buses);
  });

  router.post(RUTAS_API.buses.base, async (req, res) => {
    const entrada = esquemaRegistrarBus.parse(req.body);
    const bus = await casos.registrarBus.ejecutar(entrada);
    res.status(201).json(bus);
  });

  return router;
}
