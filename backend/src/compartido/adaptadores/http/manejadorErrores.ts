import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErrorDeDominio } from '../../dominio/ErrorDeDominio';

/** traduce los errores a respuestas HTTP segun el contrato de la API */
export function manejadorErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      codigo: 'solicitud_invalida',
      mensaje: 'Los datos enviados no tienen el formato correcto',
      detalles: error.issues,
    });
    return;
  }

  if (error instanceof ErrorDeDominio) {
    res.status(error.estadoHttp).json({ codigo: error.codigo, mensaje: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ codigo: 'error_interno', mensaje: 'Ocurrio un error inesperado' });
}
