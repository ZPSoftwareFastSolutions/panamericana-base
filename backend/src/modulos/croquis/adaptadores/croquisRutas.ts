import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_INTERNOS, SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { GenerarCroquis } from '../casos-de-uso/GenerarCroquis';
import type { ObtenerCroquis } from '../casos-de-uso/ObtenerCroquis';
import type { RegistrarAsiento } from '../casos-de-uso/RegistrarAsiento';

const esquemaBus = z.object({ id: z.uuid() });

const esquemaGenerar = z.object({
  pisos: z
    .array(
      z.object({
        piso: z.number().int(),
        filas: z.number().int(),
        asientos_por_fila: z.union([z.literal(3), z.literal(4)]),
        tipo: z.string().min(1),
      }),
    )
    .min(1),
});

const esquemaAsiento = z.object({
  numero: z.number().int(),
  piso: z.number().int(),
  fila: z.number().int(),
  columna: z.number().int(),
  tipo: z.string().min(1),
});

/** Adaptador HTTP del modulo croquis: los asientos de un bus */
export function croquisRutas(
  casos: { obtenerCroquis: ObtenerCroquis; generarCroquis: GenerarCroquis; registrarAsiento: RegistrarAsiento },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  router.get(RUTAS_API.croquis.porBus, autorizacion.requiere(...ROLES_INTERNOS), async (req, res) => {
    const { id } = esquemaBus.parse(req.params);
    res.json(await casos.obtenerCroquis.ejecutar(id));
  });

  router.post(RUTAS_API.croquis.generar, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const { id } = esquemaBus.parse(req.params);
    const { pisos } = esquemaGenerar.parse(req.body);
    res.status(201).json(await casos.generarCroquis.ejecutar(id, pisos));
  });

  router.post(RUTAS_API.croquis.porBus, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const { id } = esquemaBus.parse(req.params);
    const asiento = esquemaAsiento.parse(req.body);
    res.status(201).json(await casos.registrarAsiento.ejecutar(id, asiento));
  });

  return router;
}
