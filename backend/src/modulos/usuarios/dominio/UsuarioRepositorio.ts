import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import type { Usuario } from './Usuario';

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface UsuarioRepositorio {
  listar(): Promise<Usuario[]>;
  buscarPorId(id: string): Promise<Usuario | null>;
  existeCorreo(correo: string): Promise<boolean>;
  /** true si esa persona YA tiene una cuenta de usuario */
  existeDocumento(tipo_documento: TipoDocumento, numero_documento: string): Promise<boolean>;
  /** de la lista recibida, devuelve solo los roles que existen y estan activos en el catalogo */
  rolesExistentes(roles: string[]): Promise<string[]>;
  /** guarda la persona, la cuenta y sus roles en una sola transaccion */
  guardar(usuario: Usuario): Promise<void>;
}
