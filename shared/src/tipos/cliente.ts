import type { TipoDocumento } from './comunes';

/**
 * un cliente (pasajero, remitente o destinatario) tal como lo devuelve la API.
 * Los datos personales vienen de la tabla personas; el id es el de la tabla clientes.
 */
export type Cliente = {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  /** formato "2001-05-31" */
  fecha_nacimiento: string | null;
};

/** datos que se envian para registrar un cliente */
export type RegistrarClienteEntrada = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
  fecha_nacimiento?: string | null;
};
