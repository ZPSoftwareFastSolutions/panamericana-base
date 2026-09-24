import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class RutaInvalidaError extends ErrorDeDominio {
  readonly codigo = 'ruta_invalida';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class TerminalInvalidaError extends ErrorDeDominio {
  readonly codigo = 'terminal_invalida';
  readonly estadoHttp = 400;

  constructor() {
    super('Alguna terminal de la ruta no existe o esta inactiva');
  }
}

export class RutaDuplicadaError extends ErrorDeDominio {
  readonly codigo = 'ruta_duplicada';
  readonly estadoHttp = 409;

  constructor(nombre: string) {
    super(`Ya existe una ruta llamada "${nombre}"`);
  }
}

export class RutaNoEncontradaError extends ErrorDeDominio {
  readonly codigo = 'ruta_no_encontrada';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe una ruta con el id ${id}`);
  }
}
