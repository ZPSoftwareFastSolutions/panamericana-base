import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class BusNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'bus_no_encontrado';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe un bus con el id ${id}`);
  }
}

export class CroquisExistenteError extends ErrorDeDominio {
  readonly codigo = 'croquis_existente';
  readonly estadoHttp = 409;

  constructor() {
    super('El bus ya tiene asientos: el croquis estandar solo se genera para un bus sin asientos');
  }
}

export class AsientoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'asiento_invalido';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class AsientoDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'asiento_duplicado';
  readonly estadoHttp = 409;

  constructor(motivo = 'Ya existe un asiento con ese numero o en esa posicion') {
    super(motivo);
  }
}
