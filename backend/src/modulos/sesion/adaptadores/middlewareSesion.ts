import type { Request } from 'express';
import type { Autorizacion } from '../../../compartido/adaptadores/http/autorizacion';
import type { IdentificarUsuario } from '../casos-de-uso/IdentificarUsuario';

/** lee el token de la cabecera "Authorization: Bearer <token>" */
function tokenDe(req: Request): string | undefined {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith('Bearer ')) return undefined;
  return cabecera.slice('Bearer '.length).trim() || undefined;
}

/**
 * Crea el middleware que protege las rutas.
 * Si el usuario pasa, queda en res.locals.usuario para el resto de la peticion.
 * Si no, el error (401 o 403) llega al manejador de errores como cualquier otro.
 */
export function crearAutorizacion(identificar: IdentificarUsuario): Autorizacion {
  return {
    requiere: (...roles) => async (req, res, next) => {
      res.locals.usuario = await identificar.ejecutar(tokenDe(req), roles);
      next();
    },
  };
}
