import { describe, expect, it } from 'vitest';
import { DatoObligatorioError } from '../../../compartido/dominio/erroresComunes';
import type { CiudadDeTerminal, Terminal } from '../dominio/Terminal';
import type { TerminalRepositorio } from '../dominio/TerminalRepositorio';
import { CiudadNoEncontradaError, NombreDuplicadoError } from '../dominio/errores';
import { RegistrarTerminal } from './RegistrarTerminal';

const ORURO: CiudadDeTerminal = { id: 'ciudad-oruro', nombre: 'Oruro', departamento: 'or' };

/** repositorio falso: guarda en memoria, sin base de datos */
class TerminalRepositorioEnMemoria implements TerminalRepositorio {
  terminales: Terminal[] = [];
  ciudades: CiudadDeTerminal[] = [ORURO];

  async listar(): Promise<Terminal[]> {
    return this.terminales;
  }

  async buscarPorId(id: string): Promise<Terminal | null> {
    return this.terminales.find((terminal) => terminal.id === id) ?? null;
  }

  async existeNombre(nombre: string): Promise<boolean> {
    return this.terminales.some((t) => t.nombre.toLowerCase() === nombre.toLowerCase());
  }

  async buscarCiudad(ciudad_id: string): Promise<CiudadDeTerminal | null> {
    return this.ciudades.find((ciudad) => ciudad.id === ciudad_id) ?? null;
  }

  async guardar(terminal: Terminal): Promise<void> {
    this.terminales.push(terminal);
  }
}

describe('RegistrarTerminal', () => {
  const datosValidos = {
    nombre: 'Terminal de Buses Oruro',
    ciudad_id: ORURO.id,
    direccion: 'Av. Tomas Barron s/n',
  };

  it('registra una terminal activa con su ciudad completa', async () => {
    const repositorio = new TerminalRepositorioEnMemoria();

    const terminal = await new RegistrarTerminal(repositorio).ejecutar(datosValidos);

    expect(terminal.activo).toBe(true);
    expect(terminal.ciudad).toEqual(ORURO);
    expect(repositorio.terminales).toHaveLength(1);
  });

  it('limpia los espacios del nombre y la dirección', async () => {
    const terminal = await new RegistrarTerminal(new TerminalRepositorioEnMemoria()).ejecutar({
      ...datosValidos,
      nombre: '  Terminal   Oruro ',
    });

    expect(terminal.nombre).toBe('Terminal Oruro');
  });

  it('no permite dos terminales con el mismo nombre, aunque cambien las mayusculas', async () => {
    const registrar = new RegistrarTerminal(new TerminalRepositorioEnMemoria());
    await registrar.ejecutar(datosValidos);

    await expect(
      registrar.ejecutar({ ...datosValidos, nombre: 'terminal de buses oruro' }),
    ).rejects.toThrow(NombreDuplicadoError);
  });

  it('rechaza una ciudad que no existe', async () => {
    const registrar = new RegistrarTerminal(new TerminalRepositorioEnMemoria());

    await expect(registrar.ejecutar({ ...datosValidos, ciudad_id: 'no-existe' })).rejects.toThrow(
      CiudadNoEncontradaError,
    );
  });

  it('rechaza un nombre vacio', async () => {
    const registrar = new RegistrarTerminal(new TerminalRepositorioEnMemoria());

    await expect(registrar.ejecutar({ ...datosValidos, nombre: '   ' })).rejects.toThrow(
      DatoObligatorioError,
    );
  });
});
