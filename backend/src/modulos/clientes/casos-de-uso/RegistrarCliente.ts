import { Cliente } from '../dominio/Cliente';
import type { DatosNuevoCliente } from '../dominio/Cliente';
import type { ClienteRepositorio } from '../dominio/ClienteRepositorio';
import { ClienteDuplicadoError } from '../dominio/errores';

/**
 * Caso de uso: registrar un cliente.
 * Pasos: 1) validar los datos · 2) el documento no debe ser ya de un cliente · 3) guardar · 4) devolver lo guardado
 */
export class RegistrarCliente {
  /** @param ahora devuelve la fecha actual; en las pruebas se reemplaza por una fija */
  constructor(
    private readonly clientes: ClienteRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(entrada: DatosNuevoCliente): Promise<Cliente> {
    const cliente = Cliente.crear(entrada, this.ahora());

    const existente = await this.clientes.buscarPorDocumento(
      cliente.tipo_documento,
      cliente.numero_documento,
    );
    if (existente) {
      throw new ClienteDuplicadoError(cliente.tipo_documento, cliente.numero_documento);
    }

    await this.clientes.guardar(cliente);

    // si la persona ya existia (por ejemplo, era chofer), la base conserva sus nombres:
    // se devuelve lo que realmente quedo guardado
    return (
      (await this.clientes.buscarPorDocumento(cliente.tipo_documento, cliente.numero_documento)) ??
      cliente
    );
  }
}
