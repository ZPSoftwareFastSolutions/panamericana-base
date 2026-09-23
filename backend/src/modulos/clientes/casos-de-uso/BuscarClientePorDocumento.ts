import { normalizarDocumento } from '../../../compartido/dominio/Persona';
import type { Cliente } from '../dominio/Cliente';
import type { ClienteRepositorio } from '../dominio/ClienteRepositorio';
import { ClienteNoEncontradoError } from '../dominio/errores';

/**
 * Caso de uso: encontrar un cliente por su documento.
 * Lo usaran la compra web y la taquilla para no registrar dos veces a la misma persona.
 */
export class BuscarClientePorDocumento {
  constructor(private readonly clientes: ClienteRepositorio) {}

  async ejecutar(entrada: { tipo_documento: string; numero_documento: string }): Promise<Cliente> {
    // se limpia igual que al registrar: "4827351-1a" encuentra "4827351-1A"
    const documento = normalizarDocumento(entrada.tipo_documento, entrada.numero_documento);

    const cliente = await this.clientes.buscarPorDocumento(
      documento.tipo_documento,
      documento.numero_documento,
    );
    if (!cliente) {
      throw new ClienteNoEncontradoError(documento.tipo_documento, documento.numero_documento);
    }
    return cliente;
  }
}
