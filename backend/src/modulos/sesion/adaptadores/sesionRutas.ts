import { Router } from 'express';
import { RUTAS_API } from '@panamericana/shared';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import { ROLES_INTERNOS, usuarioEnSesion } from '../../../compartido/adaptadores/http/autorizacion';

/** GET /v1/sesion: la web lo usa al entrar al panel para saber quien es y que roles tiene */
export function sesionRutas(autorizacion: Autorizacion): Router {
  const router = Router();

  router.get(RUTAS_API.sesion.actual, autorizacion.requiere(...ROLES_INTERNOS), (_req, res) => {
    res.json(usuarioEnSesion(res));
  });

  return router;
}
