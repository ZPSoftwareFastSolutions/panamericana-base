import type { Terminal } from '../dominio/Terminal';
import type { TerminalRepositorio } from '../dominio/TerminalRepositorio';

/** Caso de uso: listar todas las terminales */
export class ListarTerminales {
  constructor(private readonly terminales: TerminalRepositorio) {}

  async ejecutar(): Promise<Terminal[]> {
    return this.terminales.listar();
  }
}
