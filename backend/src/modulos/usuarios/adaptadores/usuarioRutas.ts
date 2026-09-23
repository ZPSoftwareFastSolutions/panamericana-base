import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { ListarUsuarios } from '../casos-de-uso/ListarUsuarios';
import type { RegistrarUsuario } from '../casos-de-uso/RegistrarUsuario';

/**
 * Adaptador HTTP del modulo usuarios.
 * Zod valida la FORMA; el formato del correo, del CI y la existencia de los roles los valida el dominio.
 */
const esquemaRegistrarUsuario = z.object({
  id: z.uuid().optional(),
  correo: z.string().min(1),
  roles: z.array(z.string()),
  tipo_documento: z.string().min(1),
  numero_documento: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  telefono: z.string().nullable().optional(),
});

export function usuarioRutas(casos: {
  listarUsuarios: ListarUsuarios;
  registrarUsuario: RegistrarUsuario;
}): Router {
  const router = Router();

  router.get(RUTAS_API.usuarios.base, async (_req, res) => {
    res.json(await casos.listarUsuarios.ejecutar());
  });

  router.post(RUTAS_API.usuarios.base, async (req, res) => {
    const entrada = esquemaRegistrarUsuario.parse(req.body);
    const usuario = await casos.registrarUsuario.ejecutar(entrada);
    res.status(201).json(usuario);
  });

  return router;
}
