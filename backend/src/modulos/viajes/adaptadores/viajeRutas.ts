import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_INTERNOS, SOLO_ADMINISTRADOR } from '../../../compartido/adaptadores/http/autorizacion';
import type { BuscarViajes } from '../casos-de-uso/BuscarViajes';
import type { ConsultarDisponibilidad } from '../casos-de-uso/ConsultarDisponibilidad';
import type { EditarTarifas } from '../casos-de-uso/EditarTarifas';
import type { ListarViajes } from '../casos-de-uso/ListarViajes';
import type { ProgramarViaje } from '../casos-de-uso/ProgramarViaje';

const esquemaProgramar = z.object({
  ruta_id: z.uuid(),
  bus_id: z.uuid(),
  fecha_salida: z.iso.datetime({ offset: true }),
  tarifas: z.array(z.object({ tipo_asiento: z.string().min(1), precio: z.number() })).min(1),
});

const esquemaTarifas = z.object({
  tarifas: z.array(z.object({ tipo_asiento: z.string().min(1), precio: z.number() })).min(1),
});

const esquemaListar = z.object({ desde: z.iso.date().optional() });

const esquemaBuscar = z.object({
  origen: z.uuid(),
  destino: z.uuid(),
  fecha: z.iso.date(),
});

const esquemaTramo = z.object({
  desde: z.coerce.number().int(),
  hasta: z.coerce.number().int(),
});

/**
 * Adaptador HTTP del modulo viajes.
 * Buscar y ver asientos son PUBLICOS (los usa el portal); programar y listar son del backoffice.
 */
export function viajeRutas(
  casos: {
    listarViajes: ListarViajes;
    programarViaje: ProgramarViaje;
    buscarViajes: BuscarViajes;
    consultarDisponibilidad: ConsultarDisponibilidad;
    editarTarifas: EditarTarifas;
  },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  // publico: el portal busca viajes sin iniciar sesion
  router.get(RUTAS_API.viajes.buscar, async (req, res) => {
    const filtro = esquemaBuscar.parse(req.query);
    res.json(await casos.buscarViajes.ejecutar(filtro));
  });

  // publico: croquis con los asientos libres del tramo elegido
  router.get(RUTAS_API.viajes.asientos, async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const { desde, hasta } = esquemaTramo.parse(req.query);
    res.json(await casos.consultarDisponibilidad.ejecutar(id, desde, hasta));
  });

  router.get(RUTAS_API.viajes.base, autorizacion.requiere(...ROLES_INTERNOS), async (req, res) => {
    const { desde } = esquemaListar.parse(req.query);
    res.json(await casos.listarViajes.ejecutar(desde));
  });

  router.post(RUTAS_API.viajes.base, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const entrada = esquemaProgramar.parse(req.body);
    res.status(201).json(await casos.programarViaje.ejecutar(entrada));
  });

  router.put(RUTAS_API.viajes.tarifas, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const { tarifas } = esquemaTarifas.parse(req.body);
    res.json(await casos.editarTarifas.ejecutar(id, tarifas));
  });

  return router;
}
