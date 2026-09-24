import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_ENCOMIENDAS, usuarioEnSesion } from '../../../compartido/adaptadores/http/autorizacion';
import type { CambiarEstadoEncomienda } from '../casos-de-uso/CambiarEstadoEncomienda';
import type { ListarEncomiendas } from '../casos-de-uso/ListarEncomiendas';
import type { ObtenerEncomienda } from '../casos-de-uso/ObtenerEncomienda';
import type { RegistrarEncomienda } from '../casos-de-uso/RegistrarEncomienda';
import type { SeguirEncomienda } from '../casos-de-uso/SeguirEncomienda';
import { ESTADOS_ENCOMIENDA } from '../dominio/Encomienda';

const esquemaPersona = z.object({
  tipo_documento: z.string().min(1),
  numero_documento: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  telefono: z.string().nullable().optional(),
});

const esquemaRegistrar = z.object({
  remitente: esquemaPersona,
  destinatario: esquemaPersona,
  terminal_origen_id: z.uuid(),
  terminal_destino_id: z.uuid(),
  descripcion: z.string(),
  peso_kg: z.number(),
  costo: z.number(),
});

const esquemaCambio = z.object({
  estado: z.enum(ESTADOS_ENCOMIENDA),
  observacion: z.string().nullable().optional(),
  viaje_id: z.uuid().nullable().optional(),
});

const esquemaFiltro = z.object({ estado: z.enum(ESTADOS_ENCOMIENDA).optional() });
const esquemaCodigo = z.object({ codigo: z.string().min(3).max(20) });

/**
 * Adaptador HTTP del modulo encomiendas.
 * El personal de encomiendas (y la administradora) registra y cambia estados;
 * el seguimiento por codigo es PUBLICO y no muestra datos personales.
 */
export function encomiendaRutas(
  casos: {
    registrarEncomienda: RegistrarEncomienda;
    listarEncomiendas: ListarEncomiendas;
    obtenerEncomienda: ObtenerEncomienda;
    cambiarEstadoEncomienda: CambiarEstadoEncomienda;
    seguirEncomienda: SeguirEncomienda;
  },
  autorizacion: Autorizacion,
): Router {
  const router = Router();

  // publico: seguimiento por codigo
  router.get(RUTAS_API.encomiendas.seguimiento, async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.seguirEncomienda.ejecutar(codigo));
  });

  router.get(RUTAS_API.encomiendas.base, autorizacion.requiere(...ROLES_ENCOMIENDAS), async (req, res) => {
    const { estado } = esquemaFiltro.parse(req.query);
    res.json(await casos.listarEncomiendas.ejecutar(estado));
  });

  router.post(RUTAS_API.encomiendas.base, autorizacion.requiere(...ROLES_ENCOMIENDAS), async (req, res) => {
    const entrada = esquemaRegistrar.parse(req.body);
    const usuario = usuarioEnSesion(res);
    res.status(201).json(await casos.registrarEncomienda.ejecutar(entrada, usuario.id));
  });

  router.get(RUTAS_API.encomiendas.porCodigo, autorizacion.requiere(...ROLES_ENCOMIENDAS), async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    res.json(await casos.obtenerEncomienda.ejecutar(codigo));
  });

  router.post(RUTAS_API.encomiendas.estado, autorizacion.requiere(...ROLES_ENCOMIENDAS), async (req, res) => {
    const { codigo } = esquemaCodigo.parse(req.params);
    const entrada = esquemaCambio.parse(req.body);
    const usuario = usuarioEnSesion(res);
    res.json(await casos.cambiarEstadoEncomienda.ejecutar(codigo, entrada, usuario.id));
  });

  return router;
}
