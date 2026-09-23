import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import type { Cliente } from './Cliente';

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface ClienteRepositorio {
  listar(): Promise<Cliente[]>;
  /** devuelve el cliente con ese documento, o null si esa persona no es cliente */
  buscarPorDocumento(tipo_documento: TipoDocumento, numero_documento: string): Promise<Cliente | null>;
  /** guarda la persona (o reutiliza la existente) y el cliente, en una sola transaccion */
  guardar(cliente: Cliente): Promise<void>;
}
