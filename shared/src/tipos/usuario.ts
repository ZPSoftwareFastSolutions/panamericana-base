import type { TipoDocumento } from './comunes';

/**
 * un usuario interno tal como lo devuelve la API.
 * Los datos personales vienen de la tabla personas; la cuenta, de usuarios; los roles, de usuarios_roles.
 */
export type Usuario = {
  id: string;
  /** correo de la cuenta de acceso */
  correo: string;
  activo: boolean;
  /** codigos del catalogo roles: 'administrador', 'vendedor'... */
  roles: string[];
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
};

/** datos que se envian para registrar un usuario interno */
export type RegistrarUsuarioEntrada = {
  /** id de la cuenta en el servicio de autenticacion; si no se envia, se genera uno */
  id?: string;
  correo: string;
  roles: string[];
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
};
