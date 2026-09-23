import type { Cliente } from '../dominio/Cliente';
import type { ClienteRepositorio } from '../dominio/ClienteRepositorio';

/** Caso de uso: listar los clientes registrados */
export class ListarClientes {
  constructor(private readonly clientes: ClienteRepositorio) {}

  async ejecutar(): Promise<Cliente[]> {
    return this.clientes.listar();
  }
}
