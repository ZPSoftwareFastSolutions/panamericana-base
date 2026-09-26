import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class NombreDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'terminal_duplicada';
  readonly estadoHttp = 409;

  constructor(nombre: string) {
    super(`Ya existe una terminal con el nombre "${nombre}"`);
  }
}

export class CiudadNoEncontradaError extends ErrorDeDominio {
  readonly codigo = 'ciudad_invalida';
  readonly estadoHttp = 400;

  constructor() {
    super('La ciudad elegida no existe o no está activa');
  }
}

export class TerminalNoEncontradaError extends ErrorDeDominio {
  readonly codigo = 'terminal_no_encontrada';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe una terminal con el id ${id}`);
  }
}
