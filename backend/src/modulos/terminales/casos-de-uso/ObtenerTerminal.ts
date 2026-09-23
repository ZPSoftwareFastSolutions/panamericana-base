import type { Terminal } from '../dominio/Terminal';
import type { TerminalRepositorio } from '../dominio/TerminalRepositorio';
import { TerminalNoEncontradaError } from '../dominio/errores';

/** Caso de uso: ver el detalle de una terminal */
export class ObtenerTerminal {
  constructor(private readonly terminales: TerminalRepositorio) {}

  async ejecutar(id: string): Promise<Terminal> {
    const terminal = await this.terminales.buscarPorId(id);
    if (!terminal) {
      throw new TerminalNoEncontradaError(id);
    }
    return terminal;
  }
}
