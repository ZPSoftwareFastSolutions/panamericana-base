import { Router } from 'express';
import { z } from 'zod';
import { RUTAS_API } from '@panamericana/shared';
import type { BuscarClientePorDocumento } from '../casos-de-uso/BuscarClientePorDocumento';
import type { ListarClientes } from '../casos-de-uso/ListarClientes';
import type { RegistrarCliente } from '../casos-de-uso/RegistrarCliente';

/**
 * Adaptador HTTP del modulo clientes.
 * Zod valida la FORMA; las reglas bolivianas (CI, celular) las valida el dominio.
 */
const esquemaRegistrarCliente = z.object({
  tipo_documento: z.string().min(1),
  numero_documento: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  telefono: z.string().nullable().optional(),
  correo: z.string().nullable().optional(),
  fecha_nacimiento: z.iso.date().nullable().optional(),
});

/** GET /v1/clientes/buscar?tipo_documento=ci&numero_documento=4827351 */
const esquemaBuscar = z.object({
  tipo_documento: z.string().min(1),
  numero_documento: z.string().min(1),
});

export function clienteRutas(casos: {
  listarClientes: ListarClientes;
  buscarClientePorDocumento: BuscarClientePorDocumento;
  registrarCliente: RegistrarCliente;
}): Router {
  const router = Router();

  router.get(RUTAS_API.clientes.base, async (_req, res) => {
    res.json(await casos.listarClientes.ejecutar());
  });

  router.get(RUTAS_API.clientes.buscar, async (req, res) => {
    const filtro = esquemaBuscar.parse(req.query);
    res.json(await casos.buscarClientePorDocumento.ejecutar(filtro));
  });

  router.post(RUTAS_API.clientes.base, async (req, res) => {
    const entrada = esquemaRegistrarCliente.parse(req.body);
    const cliente = await casos.registrarCliente.ejecutar(entrada);
    res.status(201).json(cliente);
  });

  return router;
}
