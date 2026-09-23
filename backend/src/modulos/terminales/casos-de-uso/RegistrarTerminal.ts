import { Terminal } from '../dominio/Terminal';
import type { TerminalRepositorio } from '../dominio/TerminalRepositorio';
import { CiudadNoEncontradaError, NombreDuplicadoError } from '../dominio/errores';

export type EntradaRegistrarTerminal = {
  nombre: string;
  ciudad_id: string;
  direccion: string;
};

/**
 * Caso de uso: registrar una terminal.
 * Pasos: 1) la ciudad debe existir · 2) la entidad valida sus datos · 3) el nombre no se repite · 4) guardar
 */
export class RegistrarTerminal {
  constructor(private readonly terminales: TerminalRepositorio) {}

  async ejecutar(entrada: EntradaRegistrarTerminal): Promise<Terminal> {
    const ciudad = await this.terminales.buscarCiudad(entrada.ciudad_id);
    if (!ciudad) {
      throw new CiudadNoEncontradaError();
    }

    const terminal = Terminal.crear({ nombre: entrada.nombre, direccion: entrada.direccion, ciudad });

    if (await this.terminales.existeNombre(terminal.nombre)) {
      throw new NombreDuplicadoError(terminal.nombre);
    }

    await this.terminales.guardar(terminal);
    return terminal;
  }
}
