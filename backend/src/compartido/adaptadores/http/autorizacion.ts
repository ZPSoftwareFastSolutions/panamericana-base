import type { RequestHandler, Response } from 'express';

/**
 * AUTORIZACION: lo que las rutas de cualquier modulo necesitan para proteger un endpoint.
 * La implementacion real (token de Supabase + roles de la base) esta en modulos/sesion.
 *
 * Uso en un archivo de rutas:
 *   router.post(RUTAS_API.buses.base, autorizacion.requiere(...SOLO_ADMINISTRADOR), async (req, res) => { ... })
 */

/** el usuario que hizo la peticion, ya identificado */
export type UsuarioEnSesion = {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  roles: string[];
};

export interface Autorizacion {
  /**
   * exige un token valido de una cuenta activa.
   * Si se pasan roles, el usuario debe tener AL MENOS uno de ellos (si no: 403).
   */
  requiere(...roles: string[]): RequestHandler;
}

/** todos los roles del personal: pueden entrar al panel */
export const ROLES_INTERNOS = ['administrador', 'vendedor', 'encomiendas'];
/** configuracion del sistema: flota, rutas, viajes, usuarios */
export const SOLO_ADMINISTRADOR = ['administrador'];
/** venta presencial y anulaciones */
export const ROLES_VENTA = ['administrador', 'vendedor'];
/** registro y seguimiento de encomiendas */
export const ROLES_ENCOMIENDAS = ['administrador', 'encomiendas'];

/** devuelve el usuario que dejo el middleware en res.locals (solo en rutas protegidas) */
export function usuarioEnSesion(res: Response): UsuarioEnSesion {
  const usuario = res.locals.usuario as UsuarioEnSesion | undefined;
  if (!usuario) {
    throw new Error('Esta ruta no tiene el middleware de autorizacion');
  }
  return usuario;
}
