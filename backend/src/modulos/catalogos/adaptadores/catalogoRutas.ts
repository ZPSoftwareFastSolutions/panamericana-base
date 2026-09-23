import { Router } from 'express';
import { RUTAS_API } from '@panamericana/shared';
import type { ListarCiudades } from '../casos-de-uso/ListarCiudades';
import type { ListarRoles } from '../casos-de-uso/ListarRoles';
import type { ListarTiposDocumento } from '../casos-de-uso/ListarTiposDocumento';

/** Adaptador HTTP del modulo catalogos: solo consultas GET, sin datos de entrada */
export function catalogoRutas(casos: {
  listarCiudades: ListarCiudades;
  listarTiposDocumento: ListarTiposDocumento;
  listarRoles: ListarRoles;
}): Router {
  const router = Router();

  router.get(RUTAS_API.catalogos.ciudades, async (_req, res) => {
    res.json(await casos.listarCiudades.ejecutar());
  });

  router.get(RUTAS_API.catalogos.tiposDocumento, async (_req, res) => {
    res.json(await casos.listarTiposDocumento.ejecutar());
  });

  router.get(RUTAS_API.catalogos.roles, async (_req, res) => {
    res.json(await casos.listarRoles.ejecutar());
  });

  return router;
}
