import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class ClienteDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'cliente_duplicado';
  readonly estadoHttp = 409;

  constructor(tipo_documento: string, numero_documento: string) {
    super(`Ya existe un cliente con ${tipo_documento.toUpperCase()} ${numero_documento}`);
  }
}

export class ClienteNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'cliente_no_encontrado';
  readonly estadoHttp = 404;

  constructor(tipo_documento: string, numero_documento: string) {
    super(`No hay un cliente con ${tipo_documento.toUpperCase()} ${numero_documento}`);
  }
}
