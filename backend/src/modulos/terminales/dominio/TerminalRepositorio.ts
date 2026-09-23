import type { CiudadDeTerminal, Terminal } from './Terminal';

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface TerminalRepositorio {
  listar(): Promise<Terminal[]>;
  buscarPorId(id: string): Promise<Terminal | null>;
  /** compara sin importar mayusculas: "terminal oruro" y "Terminal Oruro" son la misma */
  existeNombre(nombre: string): Promise<boolean>;
  /** devuelve la ciudad si existe y esta activa */
  buscarCiudad(ciudad_id: string): Promise<CiudadDeTerminal | null>;
  guardar(terminal: Terminal): Promise<void>;
}
