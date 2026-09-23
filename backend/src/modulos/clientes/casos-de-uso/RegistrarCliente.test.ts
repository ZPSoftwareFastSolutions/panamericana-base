import { describe, expect, it } from 'vitest';
import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import { DocumentoInvalidoError, TelefonoInvalidoError } from '../../../compartido/dominio/erroresPersona';
import type { Cliente } from '../dominio/Cliente';
import type { ClienteRepositorio } from '../dominio/ClienteRepositorio';
import { ClienteDuplicadoError, ClienteNoEncontradoError } from '../dominio/errores';
import { BuscarClientePorDocumento } from './BuscarClientePorDocumento';
import { RegistrarCliente } from './RegistrarCliente';

const HOY = new Date('2026-09-23T12:00:00Z');

/** repositorio falso: guarda en memoria, sin base de datos */
class ClienteRepositorioEnMemoria implements ClienteRepositorio {
  clientes: Cliente[] = [];

  async listar(): Promise<Cliente[]> {
    return this.clientes;
  }

  async buscarPorDocumento(tipo: TipoDocumento, numero: string): Promise<Cliente | null> {
    return (
      this.clientes.find((c) => c.tipo_documento === tipo && c.numero_documento === numero) ?? null
    );
  }

  async guardar(cliente: Cliente): Promise<void> {
    this.clientes.push(cliente);
  }
}

const datosValidos = {
  tipo_documento: 'ci' as const,
  numero_documento: '4827351',
  nombres: 'Maria',
  apellidos: 'Flores',
  telefono: '71234567',
};

function crearCaso() {
  const repositorio = new ClienteRepositorioEnMemoria();
  return {
    repositorio,
    registrar: new RegistrarCliente(repositorio, () => HOY),
    buscar: new BuscarClientePorDocumento(repositorio),
  };
}

describe('RegistrarCliente', () => {
  it('registra un cliente con los datos limpios', async () => {
    const { registrar, repositorio } = crearCaso();

    const cliente = await registrar.ejecutar({ ...datosValidos, numero_documento: '4827351-1a' });

    expect(cliente.numero_documento).toBe('4827351-1A');
    expect(repositorio.clientes).toHaveLength(1);
  });

  it('no registra dos veces el mismo documento', async () => {
    const { registrar } = crearCaso();
    await registrar.ejecutar(datosValidos);

    await expect(registrar.ejecutar({ ...datosValidos, nombres: 'Otra' })).rejects.toThrow(
      ClienteDuplicadoError,
    );
  });

  it('el mismo numero con otro tipo de documento es otra persona', async () => {
    const { registrar, repositorio } = crearCaso();
    await registrar.ejecutar(datosValidos);

    await registrar.ejecutar({ ...datosValidos, tipo_documento: 'ce' });

    expect(repositorio.clientes).toHaveLength(2);
  });

  it('valida las reglas bolivianas de la persona (ci y celular)', async () => {
    const { registrar } = crearCaso();

    await expect(registrar.ejecutar({ ...datosValidos, numero_documento: 'ABC' })).rejects.toThrow(
      DocumentoInvalidoError,
    );
    await expect(registrar.ejecutar({ ...datosValidos, telefono: '5551234' })).rejects.toThrow(
      TelefonoInvalidoError,
    );
  });
});

describe('BuscarClientePorDocumento', () => {
  it('encuentra al cliente aunque el documento se escriba distinto', async () => {
    const { registrar, buscar } = crearCaso();
    await registrar.ejecutar({ ...datosValidos, numero_documento: '4827351-1A' });

    const cliente = await buscar.ejecutar({ tipo_documento: 'CI', numero_documento: ' 4827351-1a' });

    expect(cliente.nombres).toBe('Maria');
  });

  it('responde "no encontrado" si el documento no es de un cliente', async () => {
    const { buscar } = crearCaso();

    await expect(
      buscar.ejecutar({ tipo_documento: 'ci', numero_documento: '9999999' }),
    ).rejects.toThrow(ClienteNoEncontradoError);
  });
});
